import { data, redirect } from "react-router";
import type { Route } from "./+types/unsubscribe";
import { db } from "../services/db.server";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const email = url.searchParams.get("email");

  if (!email) {
    return data({ success: false, message: "Email address is required." }, { status: 400 });
  }

  try {
    // Find user by email
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return data(
        {
          success: false,
          message: "We couldn't find an account with that email address.",
        },
        { status: 404 }
      );
    }

    // Update the user's email subscription preference
    await db.user.update({
      where: { email },
      data: { emailSubscribed: false },
    });

    return data({
      success: true,
      message: "You have been successfully unsubscribed from email notifications.",
    });
  } catch (error) {
    console.error("Error unsubscribing user:", error);
    return data(
      {
        success: false,
        message: "An error occurred. Please try again later.",
      },
      { status: 500 }
    );
  }
}

export default function Unsubscribe({ loaderData }: Route.ComponentProps) {
  const { success, message } = loaderData;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {success ? (
          <>
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4 mx-auto">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">
              Unsubscribed Successfully
            </h1>
            <p className="text-gray-600 text-center mb-6">{message}</p>
            <p className="text-sm text-gray-500 text-center">
              You will no longer receive email notifications from us. You can update your
              preferences anytime by logging into your account.
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4 mx-auto">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">
              Unsubscribe Failed
            </h1>
            <p className="text-gray-600 text-center mb-6">{message}</p>
            <p className="text-sm text-gray-500 text-center">
              If you continue to experience issues, please contact our support team.
            </p>
          </>
        )}
        <div className="mt-6 text-center">
          <a href="/" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Return to Home
          </a>
        </div>
      </div>
    </div>
  );
}
