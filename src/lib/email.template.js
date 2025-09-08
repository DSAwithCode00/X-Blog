export const verifyEmailHtml = `
<!doctype html>
<html lang="en">
  <head>
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <title>Verify your email</title>
    <!-- Preheader (hidden in most clients) -->
    <style>
      .preheader { display:none!important; visibility:hidden; opacity:0; color:transparent; height:0; width:0; overflow:hidden; mso-hide:all; }
      @media (prefers-color-scheme: dark) {
        table, td { background:#0b0b0b !important; }
        .card { background:#111 !important; border-color:#222 !important; }
        .text { color:#eaeaea !important; }
        .muted { color:#b3b3b3 !important; }
        .btn { background:#2563eb !important; color:#ffffff !important; }
        .code { background:#111 !important; color:#ffffff !important; border-color:#2a2a2a !important; }
      }
    </style>
  </head>
  <body style="margin:0; padding:0; background:#f4f6f8;">
    <span class="preheader">Your verification code is {code}. It expires soon.</span>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f4f6f8; padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px; background:#ffffff; border-radius:12px; border:1px solid #e6e8eb;" class="card">
            <tr>
              <td style="padding:28px 32px;">
                <!-- Header -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="left" class="text" style="font:700 20px/1.2 system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,'Helvetica Neue',Arial; color:#111827;">
                      Verify your email
                    </td>
                    <td align="right" style="font:500 14px/1 system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,'Helvetica Neue',Arial; color:#6b7280;" class="muted">
                      {code}
                    </td>
                  </tr>
                </table>

                <!-- Spacer -->
                <div style="height:16px; line-height:16px;">&nbsp;</div>

                <!-- Body copy -->
                <p class="text" style="margin:0; font:400 16px/1.6 system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,'Helvetica Neue',Arial; color:#374151;">
                  Thanks for signing up! Use the code below to verify your email address.
                </p>

                <!-- Big code box -->
                <div class="code" style="margin:20px 0 8px; padding:18px 20px; background:#0f172a0d; border:1px solid #e6e8eb; border-radius:10px; text-align:center;">
                  <div style="font:700 28px/1.2 ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace; letter-spacing:0.24em; color:#111827;">
                    {code}
                  </div>
                </div>

                <!-- Button (optional; many clients ignore JS so it's just a visual CTA) -->
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:12px auto 0;">
                  <tr>
                    <td class="btn" bgcolor="#111827" style="border-radius:8px; text-align:center;">
                      <a href="{appUrl}" style="display:inline-block; padding:12px 18px; font:600 14px/1 system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,'Helvetica Neue',Arial; color:#ffffff; text-decoration:none;">
                        Enter code in the app
                      </a>
                    </td>
                  </tr>
                </table>

                <!-- Notes -->
                <p class="muted" style="margin:16px 0 0; font:400 12px/1.6 system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,'Helvetica Neue',Arial; color:#6b7280;">
                  This code will expire in 10 minutes. If you didn’t request this, you can safely ignore this email.
                </p>

                <!-- Footer -->
                <div style="height:24px; line-height:24px;">&nbsp;</div>
                <hr style="border:none; border-top:1px solid #e6e8eb; margin:0;">
                <p class="muted" style="margin:12px 0 0; font:400 12px/1.6 system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,'Helvetica Neue',Arial; color:#6b7280; text-align:center;">
                  © ${new Date().getFullYear()} Your Company. All rights reserved.
                </p>
              </td>
            </tr>
          </table>

          <div style="max-width:600px; margin:8px auto 0; font:400 12px/1.6 system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,'Helvetica Neue',Arial; color:#6b7280; text-align:center;">
            Having trouble? Your code is: <span style="font-weight:700;">{code}</span>
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
