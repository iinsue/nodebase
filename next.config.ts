import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  // 좌측하단 N 으로 표시되는 Dev Indicator 비활성화
  devIndicators: false,
  async redirects() {
    return [
      {
        source: "/",
        destination: "/workflows",
        permanent: false,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "insu-hong",

  project: "nodebase",

  // 개발 서버에서는 Sentry 빌드 플러그인 로그 숨김. 프로덕션 빌드는 CI에서만 업로드 로그 출력.
  silent: isDev || !process.env.CI,

  // 개발 중 Sentry 빌드 플러그인 텔레메트리 비활성화
  telemetry: !isDev,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
