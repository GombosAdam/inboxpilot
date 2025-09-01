import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ArrowLeft, Shield, Lock, Eye, Database } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center space-x-2">
            <Mail className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">InboxPilot</span>
          </div>
          <div className="w-24" />
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-600">
            How we collect, use, and protect your data
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: January 2024
          </p>
        </div>

        <div className="space-y-8">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span>Our Commitment to Privacy</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                At InboxPilot, we take your privacy seriously. This Privacy Policy explains how we collect, 
                use, disclose, and safeguard your information when you use our email organization service.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Key Principles:</h4>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  <li>We never store your actual email content</li>
                  <li>We only process emails to categorize and organize them</li>
                  <li>We use enterprise-grade encryption for all data</li>
                  <li>You control your data and can delete it anytime</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-green-600" />
                <span>Information We Collect</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Account Information</h4>
                <p className="text-gray-600 mb-3">
                  When you sign up through Google OAuth, we collect:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                  <li>Your name and email address</li>
                  <li>Profile picture (if available)</li>
                  <li>Google account ID for authentication</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Email Metadata</h4>
                <p className="text-gray-600 mb-3">
                  To categorize your emails, we temporarily process:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                  <li>Subject lines and sender information</li>
                  <li>Brief email content excerpts for AI analysis</li>
                  <li>Email timestamps and labels</li>
                  <li>Categorization results and confidence scores</li>
                </ul>
                <div className="bg-yellow-50 p-3 rounded border border-yellow-200 mt-3">
                  <p className="text-yellow-800 text-sm">
                    <strong>Important:</strong> We do not permanently store your email content. 
                    Content is processed in memory and immediately discarded after categorization.
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Usage Data</h4>
                <p className="text-gray-600 mb-3">
                  We collect anonymized usage statistics to improve our service:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                  <li>Number of emails processed</li>
                  <li>Categorization accuracy metrics</li>
                  <li>Feature usage patterns</li>
                  <li>Error logs and performance data</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-purple-600" />
                <span>How We Use Your Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Service Provision</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                  <li>Authenticate your access to the service</li>
                  <li>Analyze and categorize your emails using AI</li>
                  <li>Create and apply organization labels in your Gmail</li>
                  <li>Provide usage statistics and insights</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Service Improvement</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                  <li>Improve our AI categorization algorithms</li>
                  <li>Develop new features and capabilities</li>
                  <li>Monitor service performance and reliability</li>
                  <li>Provide customer support</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Communication</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                  <li>Send important service updates and notifications</li>
                  <li>Respond to your support requests</li>
                  <li>Notify you about your subscription status</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="h-5 w-5 text-red-600" />
                <span>Data Security</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We implement industry-standard security measures to protect your information:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Encryption</h4>
                  <p className="text-sm text-gray-600">
                    All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Access Controls</h4>
                  <p className="text-sm text-gray-600">
                    Strict access controls ensure only authorized systems can process your data.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">OAuth Security</h4>
                  <p className="text-sm text-gray-600">
                    We use Google's secure OAuth 2.0 protocol for authentication and authorization.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Regular Audits</h4>
                  <p className="text-sm text-gray-600">
                    We conduct regular security audits and vulnerability assessments.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Sharing */}
          <Card>
            <CardHeader>
              <CardTitle>Data Sharing and Disclosure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We do not sell, trade, or otherwise transfer your personal information to third parties, except:
              </p>
              
              <div>
                <h4 className="font-semibold mb-2">Service Providers</h4>
                <p className="text-gray-600 mb-2">
                  We may share data with trusted service providers who help us operate our service:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                  <li>Cloud hosting providers (with encryption)</li>
                  <li>Payment processors for subscription billing</li>
                  <li>AI service providers for email categorization</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Legal Requirements</h4>
                <p className="text-gray-600">
                  We may disclose information if required by law or to protect the rights, property, 
                  or safety of InboxPilot, our users, or others.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle>Your Rights and Choices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>You have the following rights regarding your personal information:</p>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold">Access and Portability</h4>
                  <p className="text-gray-600">
                    Request a copy of the personal information we hold about you.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold">Correction</h4>
                  <p className="text-gray-600">
                    Request correction of any inaccurate personal information.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold">Deletion</h4>
                  <p className="text-gray-600">
                    Request deletion of your account and all associated data.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold">Revoke Access</h4>
                  <p className="text-gray-600">
                    Revoke Gmail access permissions through your Google Account settings.
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-blue-800">
                  <strong>To exercise these rights:</strong> Contact us at privacy@inboxpilot.com or 
                  manage your data through your dashboard settings.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>Email:</strong> privacy@inboxpilot.com</p>
                <p><strong>Support:</strong> support@inboxpilot.com</p>
                <p><strong>Address:</strong> InboxPilot Privacy Team, [Your Address]</p>
              </div>

              <p className="text-sm text-gray-600">
                We will respond to your inquiry within 30 days. For urgent privacy concerns, 
                please mark your email as "URGENT - Privacy Request."
              </p>
            </CardContent>
          </Card>

          {/* Updates */}
          <Card>
            <CardHeader>
              <CardTitle>Policy Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                We may update this Privacy Policy from time to time. When we do, we will:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li>Post the updated policy on this page</li>
                <li>Update the "Last updated" date</li>
                <li>Notify you via email of significant changes</li>
                <li>Obtain your consent for material changes that affect your rights</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <Link href="/">
            <Button className="px-8">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}