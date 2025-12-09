package com.goatgoat.app.notifications

import android.app.ActivityManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Color
import android.media.RingtoneManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.widget.Toast
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.goatgoat.app.MainActivity
import com.goatgoat.app.R
import com.google.firebase.messaging.RemoteMessage
import io.invertase.firebase.messaging.ReactNativeFirebaseMessagingReceiver
import java.io.InputStream
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.Executors

/**
 * Mirrors the Seller & Delivery rich-notification behaviour for customers.
 * Extends the default React Native Firebase receiver so JS/background handlers continue to fire.
 */
class CustomerFirebaseMessagingReceiver : ReactNativeFirebaseMessagingReceiver() {

  override fun onReceive(context: Context, intent: Intent) {
    val extras = intent.extras
    if (extras != null) {
      try {
        val remoteMessage = RemoteMessage(extras)
        NotificationDispatcher.enqueue(context.applicationContext, remoteMessage)
      } catch (error: Exception) {
        Log.w(TAG, "Customer receiver failed to parse FCM extras", error)
      }
    }

    // Allow default RN Firebase flow (headless JS, JS listeners, etc.)
    super.onReceive(context, intent)
  }

  private object NotificationDispatcher {
    private val executor = Executors.newSingleThreadExecutor()

    fun enqueue(context: Context, message: RemoteMessage) {
      executor.execute {
        try {
          val payload = parsePayload(message, context)
          val bitmap = downloadBitmap(payload.imageUrl)
          showSystemNotification(context, payload, bitmap)
          maybeShowBackgroundToast(context, payload)
        } catch (error: Exception) {
          Log.e(TAG, "Failed to render customer notification payload", error)
        }
      }
    }

    private fun parsePayload(
      message: RemoteMessage,
      context: Context
    ): NotificationPayload {
      val notification = message.notification
      val data = message.data

      val title = notification?.title
        ?: data["title"]
        ?: data["heading"]
        ?: context.getString(R.string.app_name)

      val body = notification?.body
        ?: data["body"]
        ?: data["message"]
        ?: data["subtitle"]
        ?: context.getString(R.string.app_name)

      val imageUrl = notification?.imageUrl?.toString()
        ?: data["imageUrl"]
        ?: data["imageURL"]
        ?: data["image_url"]
        ?: data["image"]

      return NotificationPayload(
        title = title,
        body = body,
        imageUrl = imageUrl,
        data = data
      )
    }

    private fun showSystemNotification(
      context: Context,
      payload: NotificationPayload,
      bitmap: Bitmap?
    ) {
      val manager = NotificationManagerCompat.from(context)
      createNotificationChannel(manager)

      val pendingIntent = buildContentIntent(context, payload.data)
      val soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)

      val builder = NotificationCompat.Builder(context, CHANNEL_ID)
        .setSmallIcon(R.mipmap.ic_launcher)
        .setContentTitle(payload.title)
        .setContentText(payload.body)
        .setAutoCancel(true)
        .setSound(soundUri)
        .setColor(Color.parseColor("#22a45d"))
        .setPriority(NotificationCompat.PRIORITY_HIGH)
        .setCategory(NotificationCompat.CATEGORY_MESSAGE)
        .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
        .setContentIntent(pendingIntent)
        .setStyle(NotificationCompat.BigTextStyle().bigText(payload.body))

      bitmap?.let { largeBitmap ->
        builder.setLargeIcon(largeBitmap)
        val style = NotificationCompat.BigPictureStyle()
          .bigPicture(largeBitmap)
          .bigLargeIcon(null as Bitmap?)
          .setSummaryText(payload.body)
        builder.setStyle(style)
      }

      val notificationId = System.currentTimeMillis().toInt()
      manager.notify(notificationId, builder.build())
    }

    private fun buildContentIntent(
      context: Context,
      data: Map<String, String>
    ): PendingIntent {
      val intent = Intent(context, MainActivity::class.java).apply {
        addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
        data.forEach { (key, value) ->
          putExtra(key, value)
        }
      }

      val flags = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
      return PendingIntent.getActivity(context, REQUEST_CODE, intent, flags)
    }

    private fun maybeShowBackgroundToast(context: Context, payload: NotificationPayload) {
      if (isAppInForeground(context)) {
        return
      }

      Handler(Looper.getMainLooper()).post {
        val toastMessage = "${payload.title}: ${payload.body}"
        Toast.makeText(context, toastMessage, Toast.LENGTH_LONG).show()
      }
    }

    private fun isAppInForeground(context: Context): Boolean {
      val activityManager =
        context.getSystemService(Context.ACTIVITY_SERVICE) as? ActivityManager ?: return false
      val processes = activityManager.runningAppProcesses ?: return false
      val packageName = context.packageName

      processes.forEach { process ->
        if (process.processName == packageName) {
          val importance = process.importance
          return importance == ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND ||
            importance == ActivityManager.RunningAppProcessInfo.IMPORTANCE_VISIBLE
        }
      }

      return false
    }

    private fun downloadBitmap(imageUrl: String?): Bitmap? {
      if (imageUrl.isNullOrBlank()) {
        return null
      }

      return try {
        val url = URL(imageUrl)
        val connection = url.openConnection() as HttpURLConnection
        connection.connectTimeout = 7000
        connection.readTimeout = 7000
        connection.doInput = true
        connection.instanceFollowRedirects = true
        connection.connect()

        val stream: InputStream = connection.inputStream
        stream.use { BitmapFactory.decodeStream(it) }
      } catch (error: Exception) {
        Log.w(TAG, "Unable to download customer notification image: ${error.message}")
        null
      }
    }

    private fun createNotificationChannel(manager: NotificationManagerCompat) {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
        return
      }

      val channel = NotificationChannel(
        CHANNEL_ID,
        "Customer Notifications",
        NotificationManager.IMPORTANCE_HIGH
      ).apply {
        description = "Promotions, order updates, and system alerts for customers"
        enableLights(true)
        lightColor = Color.parseColor("#22a45d")
        enableVibration(true)
        setShowBadge(true)
      }

      manager.createNotificationChannel(channel)
    }
  }

  private data class NotificationPayload(
    val title: String,
    val body: String,
    val imageUrl: String?,
    val data: Map<String, String>
  )

  companion object {
    private const val TAG = "CustomerFCMReceiver"
    private const val CHANNEL_ID = "goatgoat_customer_notifications"
    private const val REQUEST_CODE = 4096
  }
}
