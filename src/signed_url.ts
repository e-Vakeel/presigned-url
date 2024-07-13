import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import serverless from "serverless-http"
import express from "express"
import bodyParser from "body-parser"



const corsOptions = {
  origin: "http://your-react-app-origin", // Specify the allowed origin
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Specify the allowed methods
  allowedHeaders: "Content-Type,Authorization", // Specify the allowed headers
  credentials: true, // Allow cookies to be sent
  optionsSuccessStatus: 204, // Set the response status for successful preflight requests
};



const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// app.listen(3000, () => { console.log("Server is running on port 3000") });

const s3Client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: "AKIA4MTWMLPKWSAW6NB4",
    secretAccessKey: "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",
  }
});

async function getSignedUrlForGet(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: "e-vakeel",
    Key: key,
  });
  
  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  return url;
}

async function printURL(): Promise<void> {
  const url = await getSignedUrlForGet("access control.pdf");
  console.log("URL is", url);
}

async function getSignedUrlForPut(filename: string, contentType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: "e-vakeel",
    Key: `/user/userID/${filename}`,
    ContentType: contentType,
  });
  
  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  console.log(url);
  return url;
}

// printURL();

// getSignedUrlForGet("new.pdf", "application/pdf");



app.post("/", async (req, res, next) => {
  let filename = req.body.filename;
  let contentType = req.body.contentType;
  const response = await getSignedUrlForPut(filename, contentType)
  console.log(response);
  response?res.status(200).send(response):res.status(500).send("invalid request or ceredentials");
  
});


app.get("/", async (req, res, next) => {
  let filename = req.query.filename;
  const response = await getSignedUrlForGet(filename)
  console.log(response);
  response?res.status(200).send(response):res.status(500).send("invalid request or ceredentials");
  
});


// module.exports.handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
//   if (event.bodyevent.body.filename && event.body.contentType) {
//     let filename = event.body.filename;
//     let contentType = event.body.contentType;
//     const response = await getSignedUrlForPut(filename, contentType)
//     return response ? { statusCode: 200, body: response } : { statusCode: 500, body: "invalid request or ceredentials" };
//   }
// }

export const handler = serverless(app);