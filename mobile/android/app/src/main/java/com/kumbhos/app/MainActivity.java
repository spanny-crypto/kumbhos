package com.kumbhos.app;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.webkit.PermissionRequest;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebChromeClient;

public class MainActivity extends BridgeActivity {
  private static final int MIC_PERMISSION_REQUEST_CODE = 9001;
  private PermissionRequest pendingWebViewMicRequest;

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
