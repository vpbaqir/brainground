package com.vpbaqir.brainplayground;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.graphics.Color;
import android.view.View;
import android.widget.FrameLayout;
import android.widget.LinearLayout;

import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdSize;
import com.google.android.gms.ads.AdView;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.RequestConfiguration;

public class MainActivity extends Activity {
    private WebView webView;
    private AdView adView;
    private FrameLayout adContainer;

    private static final String TEST_BANNER_AD_UNIT =
            "ca-app-pub-3940256099942544/9214589741";

    @Override protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        RequestConfiguration config = MobileAds.getRequestConfiguration()
                .toBuilder()
                .setTagForChildDirectedTreatment(
                        RequestConfiguration.TAG_FOR_CHILD_DIRECTED_TREATMENT_TRUE)
                .setMaxAdContentRating(RequestConfiguration.MAX_AD_CONTENT_RATING_G)
                .build();
        MobileAds.setRequestConfiguration(config);

        new Thread(() -> MobileAds.initialize(this, status -> runOnUiThread(this::loadBanner))).start();

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.WHITE);

        webView = new WebView(this);
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        webView.setWebViewClient(new WebViewClient());
        webView.addJavascriptInterface(new AdBridge(), "AndroidAd");

        adContainer = new FrameLayout(this);
        adContainer.setBackgroundColor(Color.WHITE);
        adContainer.setVisibility(View.VISIBLE);

        root.addView(webView, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, 0, 1f));
        root.addView(adContainer, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT));

        setContentView(root);
        webView.loadUrl("file:///android_asset/index.html");
    }

    private void loadBanner() {
        if (adView != null) return;
        adView = new AdView(this);
        adView.setAdUnitId(TEST_BANNER_AD_UNIT);
        adView.setAdSize(getAdaptiveAdSize());
        adContainer.removeAllViews();
        adContainer.addView(adView, new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.WRAP_CONTENT));
        adView.loadAd(new AdRequest.Builder().build());
    }

    private AdSize getAdaptiveAdSize() {
        float density = getResources().getDisplayMetrics().density;
        int widthDp = (int) (getResources().getDisplayMetrics().widthPixels / density);
        return AdSize.getCurrentOrientationAnchoredAdaptiveBannerAdSize(this, widthDp);
    }

    private class AdBridge {
        @JavascriptInterface
        public void setBannerVisible(final boolean visible) {
            runOnUiThread(() -> {
                if (adContainer != null) {
                    adContainer.setVisibility(visible ? View.VISIBLE : View.GONE);
                }
            });
        }
    }

    @Override protected void onDestroy() {
        if (adView != null) {
            adView.destroy();
            adView = null;
        }
        super.onDestroy();
    }

    @Override public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }
}
