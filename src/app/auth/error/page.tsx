"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams?.get("error");

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return {
          title: "Server Configuration Error",
          description: "There's an issue with our authentication setup. Please try again later or contact support.",
        };
      case "AccessDenied":
        return {
          title: "Access Denied",
          description: "You cancelled the sign-in process or denied access to your Gmail account. We need Gmail access to organize your emails.",
        };
      case "Verification":
        return {
          title: "Verification Error",
          description: "Unable to verify your account. This might be a temporary issue. Please try signing in again.",
        };
      case "OAuthSignin":
      case "OAuthCallback":
        return {
          title: "OAuth Error",
          description: "There was a problem connecting to Google. Please check your internet connection and try again.",
        };
      case "OAuthCreateAccount":
        return {
          title: "Account Creation Error",
          description: "We couldn't create your account. This might be because your Gmail account doesn't have the required permissions.",
        };
      case "EmailCreateAccount":
        return {
          title: "Email Account Error",
          description: "There was a problem with your email account. Please ensure you're using a valid Gmail address.",
        };
      case "Callback":
        return {
          title: "Callback Error",
          description: "Something went wrong during the sign-in process. Please try again.",
        };
      case "OAuthAccountNotLinked":
        return {
          title: "Account Not Linked",
          description: "Your account appears to be associated with a different sign-in method. Try signing in with your original method.",
        };
      case "SessionRequired":
        return {
          title: "Session Required",
          description: "You need to be signed in to access this page. Please sign in and try again.",
        };
      default:
        return {
          title: "Authentication Error",
          description: "An unexpected error occurred during sign-in. Please try again or contact support if the problem persists.",
        };
    }
  };

  const { title, description } = getErrorMessage(error);

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border border-red-200">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-red-900">{title}</CardTitle>
            <CardDescription className="text-red-700 text-base">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error === "AccessDenied" && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Why do we need Gmail access?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Read your emails to categorize them</li>
                  <li>• Create and apply organization labels</li>
                  <li>• Provide you with email analytics</li>
                </ul>
                <p className="text-xs text-blue-700 mt-2">
                  We never store your email content and only process emails to organize them.
                </p>
              </div>
            )}

            <div className="flex flex-col space-y-3">
              <Link href="/auth/signin">
                <Button className="w-full" size="lg">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full" size="lg">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 text-center">
                Still having trouble?{" "}
                <a
                  href="mailto:support@inboxpilot.com"
                  className="text-blue-600 hover:underline"
                >
                  Contact our support team
                </a>
              </p>
            </div>

            {error && (
              <details className="text-xs text-gray-500">
                <summary className="cursor-pointer hover:text-gray-700">
                  Technical details
                </summary>
                <div className="mt-2 p-2 bg-gray-100 rounded font-mono">
                  Error code: {error}
                </div>
              </details>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border border-red-200">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-red-900">Loading...</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}