import mjml2html from 'mjml';

const mjmlTemplate = `
  <mjml>
    <mj-head>
      <mj-title>Test Email</mj-title>
    </mj-head>
    <mj-body background-color="#fdfbf7">
      <mj-section>
        <mj-column>
          <mj-text>Hello world</mj-text>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>
`;

(async () => {
  try {
    const result = await mjml2html(mjmlTemplate);
    console.log('result:', result);
  } catch (e) {
    console.error('Crash:', e);
  }
})();
