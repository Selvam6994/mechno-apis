import * as dotenv from "dotenv";
dotenv.config();
import express, { response } from "express";
import bodyParser from "body-parser";
import nodeMailer from "nodemailer";
import path from "path";
import CORS from "cors";
import multer from "multer";
import fs from "fs";

const app = express();
const PORT = 4000;
app.use(CORS());
app.use(express.static("./attachments"));
app.use(express.json());
app.use(bodyParser.json());
console.log(process.env.USER_MAIL_ID);
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./attachments");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.originalname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});
let upload = multer({
  storage: storage,
  limits: {
    fileSize: 2000000,
  },
});

let uploadHandler = upload.single("file");

app.post("/upload", async (request, response, next) => {
  uploadHandler(request, response, function (err) {
    const fileName = request.file.filename;
    if (err instanceof multer.MulterError) {
      if (err.code == "LIMIT_FILE_SIZE") {
        response.status(400).send({ message: "file size should be below 2MB" });
      }
      return;
    }
    if (!request.file) {
      response.status(400).send({ message: "no file" });
    } else {
      response.status(200).send({ message: "uploaded" });
    }
  });
});

app.post("/attachmentemail", async function (request, response) {
  const {
    companyname,
    name,
    email,
    phone,
    subject,
    message,
    check,
    otheroption,
  } = await request.body;
  check.push(otheroption);
  fs.readdir("./attachments", (err, file) => {
    console.log(file);

    let transporter = nodeMailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.USER_MAIL_ID,
        pass: process.env.APP_PASSWORD,
      },
    });

    let info = transporter.sendMail(
      {
        from: `${companyname} via ${process.env.USER_MAIL_ID}`,
        to: process.env.USER_MAIL_ID,
        subject: ` ${check}-reg `,
        phone: phone,
        html: `<h3>Dear sir,</h3>
          </br>
          <div>${message}</div>
        
          </br>
          <pre>
  Thanks & Regards,
  ${name}
  ${companyname}
  ${email}
  ${phone}
          </pre>
          `,
        attachments: [
          {
            filename: file[1],
            path: `./attachments/${file[1]}`,
          },
        ],
      },
      (err) => {
        if (err) {
          console.log("error", err);
        } else {
          console.log("email sent successfully");
          fs.unlink(`./attachments/${file[1]}`, function (err) {
            if (err) {
              console.log("error");
            } else {
              console.log("deleted");
            }
          });
        }
      }
    );

    response.status(200).send({
      message: "email sent successfully",
      id: process.env.USER_MAIL_ID,
    });
    console.log(
      companyname,
      name,
      email,
      phone,
      subject,
      message,
      check,
      otheroption
    );
  });
});

app.post("/onlymail", async (request, response) => {
  const { companyname, name, email, phone, message, check, otheroption } =
    await request.body;
  check.push(otheroption);
  let transporter = nodeMailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.USER_MAIL_ID,
      pass: process.env.APP_PASSWORD,
    },
  });

  let info = transporter.sendMail(
    {
      from: `${companyname} via ${process.env.USER_MAIL_ID}`,
      to: process.env.USER_MAIL_ID,
      subject: ` ${check}-reg `,
      phone: phone,
      html: `<h3>Dear sir,</h3>
        </br>
        <div>${message}</div>
      
        </br>
        <pre>
Thanks & Regards,
${name}
${companyname}
${email}
${phone}
        </pre>
        `,
    },
    (err) => {
      if (err) {
        console.log("error", err);
      } else {
        console.log("email sent successfully");
        fs.unlink(`./attachments/${file[1]}`, function (err) {
          if (err) {
            console.log("error");
          } else {
            console.log("deleted");
          }
        });
      }
    }
  );
  response.status(200).send({
    message: "email sent successfully",
    id: process.env.USER_MAIL_ID,
  });
  console.log(companyname, name, email, phone, message, check);
});

app.listen(PORT, () => console.log(`The server started in: ${PORT} ✨✨`));
