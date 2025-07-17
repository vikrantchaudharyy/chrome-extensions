document.addEventListener("DOMContentLoaded", function () {
  const input = document.getElementById("certInput");
  const output = document.getElementById("certOutput");
  const parseBtn = document.getElementById("parseBtn");

  parseBtn.addEventListener("click", () => {
    const raw = input.value.trim();

    // Normalize newlines
    const normalized = raw.replace(/\\n/g, "\n");

    // Split into individual certs
    const certs = normalized
      .split(/-----END CERTIFICATE-----\s*/)
      .filter(c => c.includes("-----BEGIN CERTIFICATE-----"))
      .map(c => c.trim() + "\n-----END CERTIFICATE-----");

    output.innerHTML = "";

    certs.forEach((certPEM, index) => {
      try {
        const x509 = new X509();
        x509.readCertPEM(certPEM);

        const subject = x509.getSubjectString();
        const issuer = x509.getIssuerString();

        const notBeforeRaw = x509.getNotBefore(); // e.g. "230101000000Z"
        const notAfterRaw = x509.getNotAfter();    // e.g. "250101000000Z"

        const notBefore = parseASN1Date(notBeforeRaw);
        const notAfter = parseASN1Date(notAfterRaw);

        const serial = x509.getSerialNumberHex();
        const sigAlg = x509.getSignatureAlgorithmField();
        const version = x509.version;

        const certDetails = `
          <div class="cert-block">
            <h3>Certificate ${index + 1}</h3>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Issuer:</strong> ${issuer}</p>
            <p><strong>Valid From:</strong> ${notBefore}</p>
            <p><strong>Valid To:</strong> ${notAfter}</p>
            <p><strong>Serial Number:</strong> ${serial}</p>
            <p><strong>Signature Algorithm:</strong> ${sigAlg}</p>
            <p><strong>Version:</strong> ${version}</p>
          </div>
        `;

        output.innerHTML += certDetails;
      } catch (err) {
        output.innerHTML += `<div class="cert-block error">
          <h3>Certificate ${index + 1} - Invalid</h3>
          <pre>${err}</pre>
        </div>`;
      }
    });
  });
});

// Converts "YYMMDDHHMMSSZ" or "YYYYMMDDHHMMSSZ" to local datetime string
function parseASN1Date(asn1) {
  if (!asn1.endsWith('Z')) return asn1;
  const date = asn1.length === 13 // UTCTime (YYMMDD...) vs GeneralizedTime (YYYYMMDD...)
    ? new Date(Date.UTC(
        2000 + parseInt(asn1.slice(0, 2), 10),
        parseInt(asn1.slice(2, 4)) - 1,
        parseInt(asn1.slice(4, 6)),
        parseInt(asn1.slice(6, 8)),
        parseInt(asn1.slice(8, 10)),
        parseInt(asn1.slice(10, 12))
      ))
    : new Date(Date.UTC(
        parseInt(asn1.slice(0, 4), 10),
        parseInt(asn1.slice(4, 6)) - 1,
        parseInt(asn1.slice(6, 8)),
        parseInt(asn1.slice(8, 10)),
        parseInt(asn1.slice(10, 12)),
        parseInt(asn1.slice(12, 14))
      ));
  return date.toLocaleString();
}

function downloadPem(pem, filename) {
  const blob = new Blob([pem], { type: "application/x-pem-file" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}