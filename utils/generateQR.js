const fs = require("fs");
const QRCode = require("qrcode");
const PDFDocument = require("pdfkit");

function generateQRCodeAndPDF(
  id,
  phone,
  randomNumber,
  email,
  departure,
  arrival,
  departure_time,
  arrival_time,
  arrivalDate,
  Date,
  bus_number,
  routenumber,
  price,
  seatNumbers,
  tempBookId
) {
  const qrCodeData = String(randomNumber);

  return new Promise((resolve, reject) => {
    QRCode.toFile("qrcode.png", qrCodeData, function (err) {
      if (err) {
        reject(err);
      } else {
        console.log("QR code generated!");

        // Ensure the pdf folder exists
        if (!fs.existsSync("pdf")) {
          fs.mkdirSync("pdf");
        }

        const doc = new PDFDocument();
        doc.pipe(fs.createWriteStream(`pdf/${tempBookId}.pdf`));

        doc
          .rect(40, 40, doc.page.width - 80, 390)
          .lineWidth(1)
          .strokeColor("#FF7F3E")
          .fillAndStroke("#FFFFFF", "#000000");
        doc
          .rect(50, 50, doc.page.width - 100, 45)
          .fillColor("#000991")
          .fill();
        doc.image("favIcon.png", 60, 55, { width: 35 });
        doc
          .font("Helvetica-Bold")
          .fontSize(20)
          .fillColor("#FFFFFF")
          .text("ESeats.lk  Travel Pass", 100, 65, {
            width: doc.page.width - 200,
            align: "center",
          });
        doc.moveDown();
        doc.image("qrcode.png", 420, 100, { width: 150 });
        doc.fontSize(14).fillColor("grey").text("ID:", 60, 120);
        doc.fontSize(14).fillColor("black").text(id, 170, 120);
        doc.fontSize(14).fillColor("grey").text("Email:", 60, 150);
        doc.fontSize(14).fillColor("black").text(email, 170, 150);
        doc.fontSize(14).fillColor("grey").text("Phone Number:", 60, 180);
        doc.fontSize(14).fillColor("black").text(phone, 170, 180);
        doc.fontSize(14).fillColor("grey").text("Seat Numbers:", 60, 210);
        doc.fontSize(14).fillColor("black").text(seatNumbers, 170, 210);
        doc.fontSize(14).fillColor("grey").text("Bus Number:", 250, 210);
        doc.fontSize(14).fillColor("black").text(bus_number, 350, 210);
        doc.fontSize(14).fillColor("grey").text("Price:", 60, 240);
        doc.fontSize(14).fillColor("black").text(`Rs. ${price}.00`, 170, 240);
        doc.lineWidth(2).strokeColor("#000991");
        doc
          .moveTo(50, 260)
          .lineTo(doc.page.width - 50, 260)
          .stroke();
        doc
          .fontSize(12)
          .fillColor("#000991")
          .text("Departure & Arrival Information", 60, 280);
        doc.fontSize(14).fillColor("grey").text("From:", 60, 310);
        doc.fontSize(14).fillColor("black").text(departure, 170, 310);
        doc
          .fontSize(14)
          .fillColor("grey")
          .text("To:", (doc.page.width - 120) / 2 + 60, 310);
        doc
          .fontSize(14)
          .fillColor("black")
          .text(arrival, (doc.page.width - 120) / 2 + 150, 310);
        doc.fontSize(14).fillColor("grey").text("Departure Date:", 60, 340);
        doc.fontSize(14).fillColor("black").text(Date, 170, 340);
        doc
          .fontSize(14)
          .fillColor("grey")
          .text("Arrival Date:", (doc.page.width - 120) / 2 + 60, 340);
        doc
          .fontSize(14)
          .fillColor("black")
          .text(arrivalDate, (doc.page.width - 120) / 2 + 150, 340);
        doc.fontSize(14).fillColor("grey").text("Departure Time:", 60, 370);
        doc.fontSize(14).fillColor("black").text(departure_time, 170, 370);
        doc
          .fontSize(14)
          .fillColor("grey")
          .text("Arrival Time:", (doc.page.width - 120) / 2 + 60, 370);
        doc
          .fontSize(14)
          .fillColor("black")
          .text(arrival_time, (doc.page.width - 120) / 2 + 150, 370);
        doc.end();
        console.log("PDF with QR code generated!");

        resolve();
      }
    });
  });
}

module.exports = generateQRCodeAndPDF;
