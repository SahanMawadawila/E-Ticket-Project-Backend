// generateQR.js
const fs = require('fs');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');

function generateQRCodeAndPDF(randomNumber,email,departure,arrival,departure_time,arrival_time,Date,bus_number,routenumber,price) {
  const qrCodeData = String(randomNumber);

  return new Promise((resolve, reject) => {
    // Step 2: Generate a QR code image
    QRCode.toFile('qrcode.png', qrCodeData, function (err) {
      if (err) {
        reject(err);
      } else {
        console.log('QR code generated!');

        // Step 3: Create a PDF and add the QR code image
        const doc = new PDFDocument();
        doc.pipe(fs.createWriteStream('output.pdf'));

        // Add text to the PDF
        // Example of adding borders and shading
        doc.rect(40, 40, doc.page.width - 80, 420).lineWidth(1).strokeColor('#FF7F3E').fillAndStroke('#FFFFFF', '#000000');
        doc.rect(50, 50, doc.page.width - 100, 45).fillColor('#FF7F3E').fill();
        doc.font('Helvetica-Bold').fontSize(20).fillColor('navy').text('Bus Ticket', 100, 70, { width: doc.page.width - 200, align: 'center' });
        doc.moveDown();
        doc.font('Helvetica').fontSize(14).fillColor('black');
        doc.text(`ID: ${randomNumber}`, 100, 110);
        doc.text(`Pick-up halt: ${departure}`, 100, 140);
        doc.text(`Destination: ${arrival}`, 300, 140);
        doc.text(`pick-up time: ${departure_time}`, 100, 170);
        doc.text(`arriving time: ${arrival_time}`, 300, 170);
        doc.text(`Email: ${email}`, 100, 200);
        doc.text(`Bus Number: ${bus_number}`, 100, 230);
        doc.text(`Route Number: ${routenumber}`, 300, 230);
        doc.text(`Date.: ${Date}`, 100, 260);
        doc.text(`Price: ${price}`, 300, 260);
        doc.text(`QR code `, 270, 290);
        // Center-align QR code image
        const qrImageX = (doc.page.width - 160) / 2;
        doc.image('qrcode.png', qrImageX, doc.y, { width: 150 });

        // Finalize the PDF
        doc.end();
        console.log('PDF with QR code generated!');
        
        resolve();
      }
    });
  });
}

module.exports = generateQRCodeAndPDF;
