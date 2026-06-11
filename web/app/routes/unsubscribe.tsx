import { data, Form } from "react-router";
import type { Route } from "./+types/unsubscribe";
import { db } from "../services/db.server";
import { verifyUnsubscribeToken } from "../services/unsubscribe.server";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  // GET never mutates — it only checks the link is well-formed so we can show
  // a confirm button. Prefetching scanners hitting this URL change nothing.
  const valid = token !== null && verifyUnsubscribeToken(token) !== null;

  return data({ valid, token: valid ? token : null }, valid ? undefined : { status: 400 });
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  // One-click unsubscribe (RFC 8058) POSTs `List-Unsubscribe=One-Click` to the
  // link URL without our form fields, so fall back to the query param.
  const token =
    formData.get("token") ?? new URL(request.url).searchParams.get("token");
  const userId = typeof token === "string" ? verifyUnsubscribeToken(token) : null;

  if (!userId) {
    return data(
      { success: false, message: "This unsubscribe link is invalid or has expired." },
      { status: 400 }
    );
  }

  try {
    // updateMany so a since-deleted account doesn't throw — the response is
    // identical whether or not the user still exists (no account enumeration).
    await db.user.updateMany({
      where: { id: userId },
      data: { emailSubscribed: false },
    });

    return data({
      success: true,
      message: "You have been successfully unsubscribed from email notifications.",
    });
  } catch (error) {
    console.error("Error unsubscribing user:", error);
    return data(
      { success: false, message: "An error occurred. Please try again later." },
      { status: 500 }
    );
  }
}

export default function Unsubscribe({ loaderData, actionData }: Route.ComponentProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {actionData ? (
          actionData.success ? (
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
              <p className="text-gray-600 text-center mb-6">{actionData.message}</p>
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
              <p className="text-gray-600 text-center mb-6">{actionData.message}</p>
              <p className="text-sm text-gray-500 text-center">
                If you continue to experience issues, please contact our support team.
              </p>
            </>
          )
        ) : loaderData.valid && loaderData.token ? (
          <>
            <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">
              Unsubscribe from emails
            </h1>
            <p className="text-gray-600 text-center mb-6">
              Click the button below to stop receiving email notifications from us.
            </p>
            <Form method="post" className="text-center">
              <input type="hidden" name="token" value={loaderData.token} />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-6 py-3"
              >
                Unsubscribe
              </button>
            </Form>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">
              Invalid unsubscribe link
            </h1>
            <p className="text-gray-600 text-center mb-6">
              This unsubscribe link is invalid or has expired. Please use the link from a recent
              email, or update your preferences by logging into your account.
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
