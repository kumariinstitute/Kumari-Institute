import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Transporter configuration for Kumari Institute automated notifications
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'kkumariinstitute@gmail.com',
    pass: process.env.SMTP_PASS || process.env.EMAIL_APP_PASSWORD || ''
  }
});

const SENDER_EMAIL = '"Kumari Institute Notifications" <kkumariinstitute@gmail.com>';

/**
 * 1. Cloud Function: Triggered when a tutor's verification status changes in Firestore
 * Collection: 'teachers/{teacherId}'
 */
export const onTutorVerificationStatusChanged = functions.firestore
  .document('teachers/{teacherId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data() || {};
    const afterData = change.after.data() || {};
    const teacherId = context.params.teacherId;

    const beforeStatus = beforeData.status || (beforeData.verified ? 'approved' : 'pending');
    const afterStatus = afterData.status || (afterData.verified ? 'approved' : 'pending');

    const beforeApproved = Boolean(beforeData.isApproved || beforeData.verified);
    const afterApproved = Boolean(afterData.isApproved || afterData.verified);

    // Only trigger if status or approval state has actually changed
    if (beforeStatus === afterStatus && beforeApproved === afterApproved) {
      return null;
    }

    const tutorEmail = afterData.email;
    const tutorName = afterData.name || afterData.fullName || 'Educator';

    if (!tutorEmail) {
      console.warn(`[Cloud Function] No email found for teacher ${teacherId}`);
      return null;
    }

    const isNowApproved = afterStatus === 'approved' || afterApproved;
    const isRejected = afterStatus === 'rejected';

    const subject = isNowApproved
      ? '🎉 Congratulations! Your Tutor Profile is Verified - Kumari Institute'
      : isRejected
      ? 'Notice regarding your Tutor Registration - Kumari Institute'
      : `Profile Status Update: ${afterStatus} - Kumari Institute`;

    const htmlBody = isNowApproved
      ? `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
          <div style="background: linear-gradient(135deg, #0c2340 0%, #1d4ed8 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Kumari Institute</h1>
            <p style="margin: 6px 0 0; font-size: 13px; color: #93c5fd; font-weight: 600;">Premier 1-on-1 Doorstep Home Tuitions • Rayagada</p>
          </div>
          <div style="padding: 28px 24px; color: #1e293b;">
            <div style="display: inline-block; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 9999px; padding: 4px 12px; font-size: 11px; font-weight: 700; color: #047857; margin-bottom: 16px;">
              ✓ PROFILE VERIFIED & APPROVED
            </div>
            <h2 style="margin: 0 0 12px; font-size: 20px; font-weight: 700; color: #0f172a;">Dear ${tutorName},</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 16px;">
              Great news! Your teaching credentials, certificates, and government identity proofs have been officially reviewed and approved by the Kumari Institute Academic Administration.
            </p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0;">
              <h3 style="margin: 0 0 8px; font-size: 13px; font-weight: 700; color: #1e293b; text-transform: uppercase;">Your Active Directory Status:</h3>
              <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.6;">
                <li><strong>Public Listing:</strong> Visible to parents on the Find Home Tutor search page.</li>
                <li><strong>Subjects:</strong> ${Array.isArray(afterData.subjects) ? afterData.subjects.join(', ') : 'Registered Subjects'}</li>
                <li><strong>Commission Policy:</strong> 20% administrative deduction; <strong>you receive 80% net take-home earnings</strong>.</li>
                <li><strong>Payouts:</strong> Automatic settlement directly to your bank account or UPI after each 28-day tuition billing cycle.</li>
              </ul>
            </div>
            <div style="text-align: center; margin: 24px 0 16px;">
              <a href="https://ais-pre-4kyom7bzcwur37byja3vls-575257797086.asia-east1.run.app" style="background: #1d4ed8; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-size: 14px; font-weight: 700; display: inline-block;">
                Access Tutor Dashboard →
              </a>
            </div>
            <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-top: 24px; border-top: 1px solid #f1f5f9; pt-16px;">
              For queries or timetable adjustments, reach our central office at +91 94398 51521 or kkumariinstitute@gmail.com.
            </p>
          </div>
        </div>
      `
      : `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
          <div style="background: #0c2340; padding: 28px 24px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 22px; font-weight: 800;">Kumari Institute</h1>
            <p style="margin: 4px 0 0; font-size: 12px; color: #94a3b8;">Tutor Registration Updates</p>
          </div>
          <div style="padding: 24px; color: #1e293b;">
            <h2 style="margin: 0 0 12px; font-size: 18px; color: #0f172a;">Hello ${tutorName},</h2>
            <p style="font-size: 14px; color: #475569; line-height: 1.6;">
              Your profile verification status has been updated to: <strong>${afterStatus.toUpperCase()}</strong>.
            </p>
            ${afterData.rejectionReason ? `
              <div style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 10px; padding: 14px; margin: 16px 0; color: #9f1239; font-size: 13px;">
                <strong>Admin Feedback:</strong> ${afterData.rejectionReason}
              </div>
            ` : ''}
            <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
              You can log in and update your certificates or contact our coordinator to resolve any pending verification points.
            </p>
          </div>
        </div>
      `;

    try {
      await transporter.sendMail({
        from: SENDER_EMAIL,
        to: tutorEmail,
        subject,
        html: htmlBody
      });
      console.log(`[Cloud Function] Verification status email sent to ${tutorEmail}`);
      // Record audit in Firestore
      await db.collection('activity_logs').add({
        actionType: 'notification_sent',
        category: 'tutors',
        title: `Verification Email Sent to ${tutorName}`,
        description: `Delivered verification update email (${afterStatus}) to ${tutorEmail}.`,
        targetId: teacherId,
        timestamp: new Date().toISOString()
      });
    } catch (emailErr) {
      console.error(`[Cloud Function] Failed to send email to ${tutorEmail}:`, emailErr);
    }

    return null;
  });

/**
 * 2. Cloud Function: Triggered when a tutor is assigned to a parent or student
 * Triggers on updates to 'parents/{parentId}' when assignedTutorId changes
 */
export const onTutorAssignedToParent = functions.firestore
  .document('parents/{parentId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data() || {};
    const afterData = change.after.data() || {};

    const beforeTutorId = beforeData.assignedTutorId || beforeData.assignedEducator?.id;
    const afterTutorId = afterData.assignedTutorId || afterData.assignedEducator?.id;

    // Trigger only if a new tutor has been assigned or reassigned
    if (!afterTutorId || beforeTutorId === afterTutorId) {
      return null;
    }

    // Fetch the assigned tutor's contact email
    const tutorDoc = await db.collection('teachers').doc(afterTutorId).get();
    if (!tutorDoc.exists) {
      console.warn(`[Cloud Function] Assigned tutor doc ${afterTutorId} does not exist`);
      return null;
    }

    const tutorData = tutorDoc.data() || {};
    const tutorEmail = tutorData.email;
    const tutorName = tutorData.name || tutorData.fullName || 'Educator';

    if (!tutorEmail) {
      console.warn(`[Cloud Function] No email for assigned tutor ${afterTutorId}`);
      return null;
    }

    const parentName = afterData.name || afterData.fullName || 'Parent';
    const parentPhone = afterData.phone || 'Phone upon request';
    const childName = afterData.childName || 'Student';
    const childGrade = afterData.childGrade || 'School Student';
    const board = afterData.childBoard || 'CBSE';
    const locality = afterData.locality || afterData.address || 'Rayagada';
    const timing = afterData.assignedTimeSlot || afterData.preferredTimeSlot || '5:00 PM - 6:00 PM';
    const rawFee = Number(afterData.feesAmount || tutorData.monthlyFee || 3000);
    const netEarning = Math.round(rawFee * 0.8);
    const commission = rawFee - netEarning;

    const subject = `📚 New Home Tuition Student Assigned: ${childName} (${childGrade}) - Kumari Institute`;

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(135deg, #0c2340 0%, #059669 100%); padding: 30px 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 800;">Kumari Institute</h1>
          <p style="margin: 6px 0 0; font-size: 13px; color: #a7f3d0; font-weight: 600;">New 1-on-1 Doorstep Tuition Assignment</p>
        </div>
        <div style="padding: 28px 24px; color: #1e293b;">
          <div style="display: inline-block; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 9999px; padding: 4px 12px; font-size: 11px; font-weight: 700; color: #047857; margin-bottom: 16px;">
            ✓ OFFICIAL TUITION ALLOCATION
          </div>
          <h2 style="margin: 0 0 10px; font-size: 20px; color: #0f172a;">Dear ${tutorName},</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 18px;">
            You have been assigned to provide doorstep home tuition for <strong>${childName}</strong> by the Kumari Institute Academic Administrator.
          </p>

          <!-- Student & Parent Summary Box -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 18px 0;">
            <h3 style="margin: 0 0 12px; font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Student & Family Dossier</h3>
            <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
              <tr>
                <td style="padding: 4px 0; color: #64748b; width: 140px;">Student Name:</td>
                <td style="padding: 4px 0; font-weight: 700; color: #0f172a;">${childName}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b;">Class & Board:</td>
                <td style="padding: 4px 0; font-weight: 600; color: #1e293b;">${childGrade} (${board})</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b;">Parent / Guardian:</td>
                <td style="padding: 4px 0; font-weight: 600; color: #1e293b;">${parentName}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b;">Parent Contact:</td>
                <td style="padding: 4px 0; font-weight: 700; color: #059669; font-family: monospace;">${parentPhone}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b;">Residential Address:</td>
                <td style="padding: 4px 0; font-weight: 600; color: #1e293b;">${locality}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b;">Daily Time Slot:</td>
                <td style="padding: 4px 0; font-weight: 700; color: #1d4ed8;">${timing}</td>
              </tr>
            </table>
          </div>

          <!-- Fee & Net Earnings Breakdown -->
          <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 16px; margin: 18px 0;">
            <h3 style="margin: 0 0 8px; font-size: 12px; font-weight: 800; color: #065f46; text-transform: uppercase;">Tuition Remuneration & Commission</h3>
            <div style="font-size: 13px; line-height: 1.6; color: #047857;">
              <div>• Gross Monthly Tuition Fee: <strong>₹${rawFee.toLocaleString('en-IN')}</strong></div>
              <div>• Institute Service Commission (20%): <strong>- ₹${commission.toLocaleString('en-IN')}</strong></div>
              <div style="font-size: 15px; font-weight: 800; color: #064e3b; margin-top: 6px; padding-top: 6px; border-top: 1px dashed #6ee7b7;">
                ★ Your Net Monthly Take-Home Pay (80%): ₹${netEarning.toLocaleString('en-IN')} / month
              </div>
            </div>
          </div>

          <div style="text-align: center; margin: 24px 0 16px;">
            <a href="tel:${parentPhone}" style="background: #059669; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-size: 14px; font-weight: 700; display: inline-block; margin-right: 8px;">
              📞 Call Parent to Coordinate
            </a>
          </div>

          <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
            Please contact the parent within 4 business hours to introduce yourself and establish the start date. For assistance, contact the Kumari Institute coordinator at +91 94398 51521.
          </p>
        </div>
      </div>
    `;

    try {
      await transporter.sendMail({
        from: SENDER_EMAIL,
        to: tutorEmail,
        subject,
        html: htmlBody
      });
      console.log(`[Cloud Function] Assignment email dispatched to ${tutorEmail} for student ${childName}`);

      await db.collection('activity_logs').add({
        actionType: 'notification_sent',
        category: 'tutors',
        title: `Parent Assignment Email Sent to ${tutorName}`,
        description: `Delivered student assignment notice (${childName}) to ${tutorEmail}.`,
        targetId: afterTutorId,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error(`[Cloud Function] Failed to send assignment email:`, err);
    }

    return null;
  });
