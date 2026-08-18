import mjml2html from 'mjml';
import { prisma } from '../config/db.js';

export const buildEmail = async ({
  title,
  preheader,
  contentMjml,
  ctaText,
  ctaUrl,
  footerText = ''
}) => {
  // Try to fetch active theme settings
  let theme = null;
  try {
    theme = await prisma.themeSettings.findFirst();
  } catch (err) {
    console.error('Could not fetch theme settings for email:', err);
  }

  const primaryColor = theme?.primaryColor || '#000000';
  const backgroundColor = theme?.backgroundColor || '#fdfbf7';
  const textColor = theme?.textColor || '#2c2c2c';
  const logoUrl = theme?.logoUrl || 'https://via.placeholder.com/200x50.png?text=Malkincraft';

  let ctaBlock = '';
  if (ctaText && ctaUrl) {
    ctaBlock = `
      <mj-button href="${ctaUrl}" background-color="${primaryColor}" color="#ffffff" border-radius="2px" padding="20px 0" font-weight="500">
        ${ctaText}
      </mj-button>
    `;
  }

  const mjmlTemplate = `
    <mjml>
      <mj-head>
        <mj-title>${title}</mj-title>
        ${preheader ? `<mj-preview>${preheader}</mj-preview>` : ''}
        <mj-attributes>
          <mj-text font-family="Helvetica, Arial, sans-serif" color="${textColor}" font-size="16px" line-height="24px" />
          <mj-all font-family="Helvetica, Arial, sans-serif" />
        </mj-attributes>
        <mj-style>
          .footer-link { color: #666666; text-decoration: none; }
          .main-card { box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        </mj-style>
      </mj-head>
      <mj-body background-color="${backgroundColor}">
        <mj-section padding-bottom="0px" padding-top="20px">
          <mj-column>
            <mj-image src="${logoUrl}" alt="Malkincraft" width="150px" align="center" />
          </mj-column>
        </mj-section>
        
        <mj-section background-color="#ffffff" padding="30px" border-radius="4px" padding-bottom="40px" padding-top="40px" css-class="main-card">
          <mj-column>
            ${contentMjml}
            ${ctaBlock}
          </mj-column>
        </mj-section>
        
        <mj-section>
          <mj-column>
            <mj-text align="center" font-size="12px" color="#666666" line-height="18px">
              ${footerText ? footerText + '<br/><br/>' : ''}
              &copy; ${new Date().getFullYear()} Malkincraft. All rights reserved.<br/>
              123 Business Rd, City, State, ZIP<br/>
              <a href="mailto:support@malkincraft.com" class="footer-link">support@malkincraft.com</a>
            </mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
  `;

  try {
    const { html, errors } = await mjml2html(mjmlTemplate, { validationLevel: 'soft' });
    if (errors && errors.length > 0) {
      console.warn('MJML compilation warnings:', errors);
    }
    return html;
  } catch (error) {
    console.error('MJML compile error:', error);
    // Fallback simple HTML
    return `
      <div style="font-family: sans-serif; padding: 20px;">
        <h1>${title}</h1>
        <div>${contentMjml}</div>
        ${ctaText && ctaUrl ? `<a href="${ctaUrl}" style="display:inline-block; padding: 10px 20px; background: ${primaryColor}; color: white; text-decoration: none;">${ctaText}</a>` : ''}
      </div>
    `;
  }
};
