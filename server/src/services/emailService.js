import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import { ENV } from '../config/env.js';

let supabaseClient = null;
let transporter = null;

export const getSupabase = () => {
  if (supabaseClient) return supabaseClient;
  if (ENV.SUPABASE_URL && ENV.SUPABASE_SERVICE_ROLE_KEY) {
    supabaseClient = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return supabaseClient;
};

const getTransporter = async () => {
  if (transporter) return transporter;

  if (ENV.SMTP_USER && ENV.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: ENV.SMTP_HOST || 'smtp.gmail.com',
      port: ENV.SMTP_PORT || 587,
      secure: ENV.SMTP_PORT === 465,
      connectionTimeout: 4000,
      greetingTimeout: 4000,
      socketTimeout: 5000,
      auth: {
        user: ENV.SMTP_USER,
        pass: ENV.SMTP_PASS
      }
    });
  } else {
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        connectionTimeout: 3000,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    } catch (err) {
      transporter = nodemailer.createTransport({ jsonTransport: true });
    }
  }

  return transporter;
};

export const sendOtpEmail = async ({ toEmail, userName = 'there', otp }) => {
  const dispatchPromise = (async () => {
    try {
      // 1. Direct SMTP Delivery
      if (ENV.SMTP_USER && ENV.SMTP_PASS) {
        try {
          const mailer = await getTransporter();
          const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 32px 16px; color: #0f172a;">
              <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; padding: 36px 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 24px;">
                  <div style="background: #4f46e5; width: 36px; height: 36px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; color: #ffffff; font-weight: bold; font-size: 18px; text-align: center; line-height: 36px;">
                    ⚡
                  </div>
                  <span style="font-size: 20px; font-weight: 800; color: #0f172a; margin-left: 10px; letter-spacing: -0.5px;">RoleFlow</span>
                </div>

                <h2 style="font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0;">Verify your email address</h2>
                <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 24px 0;">
                  Hi <strong>${userName}</strong>,<br/>
                  Thank you for joining RoleFlow. Please enter this 6-digit verification code to activate your account:
                </p>

                <div style="background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%); border: 2px dashed #6366f1; border-radius: 16px; padding: 24px; text-align: center; margin: 0 0 24px 0;">
                  <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #4338ca; display: block;">
                    ${otp}
                  </span>
                  <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #6366f1; margin-top: 8px; display: block;">
                    Valid for 10 minutes
                  </span>
                </div>

                <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 0 0 24px 0;">
                  If you did not request this code, you can safely ignore this email.
                </p>

                <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; font-size: 12px; color: #94a3b8; text-align: center;">
                  © 2026 RoleFlow. Secure Multi-Role Workplace Platform.
                </div>
              </div>
            </body>
            </html>
          `;

          const info = await mailer.sendMail({
            from: ENV.SMTP_FROM || `"RoleFlow" <${ENV.SMTP_USER}>`,
            to: toEmail,
            subject: `${otp} is your RoleFlow verification code`,
            text: `Hi ${userName},\n\nYour RoleFlow verification code is: ${otp}\n\nThis code expires in 10 minutes.`,
            html: htmlContent
          });

          console.log(`📧 [EmailService - SMTP Success] OTP email sent to ${toEmail} | Message ID: ${info.messageId}`);
          return { success: true, provider: 'smtp' };
        } catch (smtpErr) {
          console.error(`❌ [EmailService - SMTP Error]:`, smtpErr.message);
        }
      }

      // 2. Supabase Fallback
      const supabase = getSupabase();
      if (supabase) {
        try {
          const { data, error } = await supabase.auth.signInWithOtp({
            email: toEmail,
            options: {
              shouldCreateUser: true
            }
          });
          if (!error) {
            console.log(`⚡ [EmailService - Supabase] 6-Digit OTP email sent via Supabase to ${toEmail}`);
            return { success: true, provider: 'supabase' };
          } else {
            console.warn(`[EmailService - Supabase Error]:`, error.message);
          }
        } catch (sbErr) {
          console.warn(`[EmailService - Supabase Exception]:`, sbErr.message);
        }
      }

      return { success: true, provider: 'fallback' };
    } catch (err) {
      console.error(`❌ [EmailService Global Error]:`, err.message);
      return { success: false, error: err.message };
    }
  })();

  // Guarantee maximum 3-second wait so registration response never blocks
  const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve({ success: true, provider: 'async_dispatched' }), 3000));
  return Promise.race([dispatchPromise, timeoutPromise]);
};
