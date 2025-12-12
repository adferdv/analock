package com.analock.backgrounddownload

import android.app.DownloadManager
import android.content.Context
import android.content.IntentFilter
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.util.Log
import androidx.annotation.RequiresApi
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File

class BackgroundDownloadModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    private lateinit var downloadManager: DownloadManager

    override fun getName(): String {
        return "BackgroundDownloadModule"
    }

    @RequiresApi(Build.VERSION_CODES.TIRAMISU)
    @ReactMethod
    fun startDownload(url: String, filename: String, promise: Promise) {
        val context = reactApplicationContext
        downloadManager = context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
        Log.d("BackgroundDownloadModule", "Called download module with url: $url and file name: $filename")

        try {
            val uri = Uri.parse("$url?file=$filename")
            val externalFilesDir = context.getExternalFilesDir(Environment.DIRECTORY_DOCUMENTS)
            val absoluteFilePath = File(externalFilesDir, filename).absolutePath
            val query = DownloadManager.Query().apply {
                setFilterByStatus(
                    DownloadManager.STATUS_PENDING or
                            DownloadManager.STATUS_RUNNING or
                            DownloadManager.STATUS_PAUSED
                )
            }
            var isDownloadAlreadyEnqueued = false

            // first check if this URL is already enqueued for download
            downloadManager.query(query).use { cursor ->
                if (cursor?.moveToFirst() == true) {
                    val uriIndex = cursor.getColumnIndex(DownloadManager.COLUMN_URI)
                    do {
                        val fileUri = Uri.parse(cursor.getString(uriIndex))
                        if (fileUri.equals(uri)) {
                            isDownloadAlreadyEnqueued = true
                        }
                    } while (cursor.moveToNext())
                }
            }

            if (!isDownloadAlreadyEnqueued) {
                val request = DownloadManager.Request(uri).apply {
                    setTitle(filename)
                    setDescription("Downloading")
                    setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                    setDestinationUri(Uri.fromFile(File(absoluteFilePath)))
                }

                val downloadId = downloadManager.enqueue(request)

                // Initialize a new broadcast receiver that will be called on download completion
                val downloadCompleteReceiver = BackgroundDownloadBroadcastReceiver(
                    promise,
                    downloadManager,
                    downloadId,
                    absoluteFilePath
                )

                // Register the broadcast receiver
                context.registerReceiver(
                    downloadCompleteReceiver,
                    IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE),
                    Context.RECEIVER_EXPORTED
                )
            }
        } catch (e: Exception) {
            Log.e("BackgroundDownloadModule", "Download initialization error", e)
            promise.reject("DOWNLOAD_ERROR", e.message ?: "Unknown error")
        }
    }
}
