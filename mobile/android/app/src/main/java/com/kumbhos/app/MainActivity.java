package com.kumbhos.app;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.webkit.PermissionRequest;
import android.webkit.WebView;
import android.widget.Toast;
import androidx.activity.OnBackPressedCallback;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebChromeClient;

public class MainActivity extends BridgeActivity {
  private static final int MIC_PERMISSION_REQUEST_CODE = 9001;
  private PermissionRequest pendingWebViewMicRequest;
  private long lastBackPressAt = 0;

  // Capacitor's own WebChromeClient handles the WebView's geolocation
  // prompt already (navigator.geolocation), but not getUserMedia/mic
  // capture for the AI Assistant's voice input (Web Speech API) — Android
  // WebViews never grant that without this explicit override.
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    this.bridge
        .getWebView()
        .setWebChromeClient(
            new BridgeWebChromeClient(this.bridge) {
              @Override
              public void onPermissionRequest(final PermissionRequest request) {
                for (String resource : request.getResources()) {
                  if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(resource)) {
                    if (ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.RECORD_AUDIO)
                        == PackageManager.PERMISSION_GRANTED) {
                      request.grant(request.getResources());
                    } else {
                      pendingWebViewMicRequest = request;
                      ActivityCompat.requestPermissions(
                          MainActivity.this, new String[] {Manifest.permission.RECORD_AUDIO}, MIC_PERMISSION_REQUEST_CODE);
                    }
                    return;
                  }
                }
                super.onPermissionRequest(request);
              }
            });

    // Capacitor's default hardware-back handling only calls WebView.goBack()
    // — with no fallback, a WebView whose in-page history is empty (which
    // happens more often than expected with a client-routed static export:
    // the very first nav tap from launch, or any screen reached by a form
    // submit that changes React state rather than the URL, like "Wristband
    // ready") finishes the Activity immediately, dropping the user straight
    // out to whatever app was open before KumbhOS — with zero warning. That
    // reads as "the app randomly kicks me out" / "back takes me somewhere
    // unexpected", not intentional navigation.
    //
    // Standard three-tier Android behavior instead: go back in the WebView
    // if it can; otherwise, if we're not already on the dashboard, go there
    // (a safe, always-available screen) rather than exiting; otherwise
    // require a second back press within 2s to actually leave — so a stray
    // back press never ejects the user without warning.
    getOnBackPressedDispatcher()
        .addCallback(
            this,
            new OnBackPressedCallback(true) {
              @Override
              public void handleOnBackPressed() {
                WebView webView = bridge.getWebView();
                if (webView.canGoBack()) {
                  webView.goBack();
                  return;
                }
                String url = webView.getUrl();
                boolean atRoot = url == null || url.endsWith("/index.html") || url.matches(".*://[^/]+/?$");
                if (!atRoot) {
                  webView.evaluateJavascript("window.location.href = window.location.origin + '/index.html'", null);
                  return;
                }
                long now = System.currentTimeMillis();
                if (now - lastBackPressAt < 2000) {
                  finish();
                } else {
                  lastBackPressAt = now;
                  Toast.makeText(MainActivity.this, "Press back again to exit", Toast.LENGTH_SHORT).show();
                }
              }
            });
  }

  @Override
  public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
    super.onRequestPermissionsResult(requestCode, permissions, grantResults);
    if (requestCode == MIC_PERMISSION_REQUEST_CODE && pendingWebViewMicRequest != null) {
      if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
        pendingWebViewMicRequest.grant(pendingWebViewMicRequest.getResources());
      } else {
        pendingWebViewMicRequest.deny();
      }
      pendingWebViewMicRequest = null;
    }
  }
}
