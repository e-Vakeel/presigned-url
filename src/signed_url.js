"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const serverless_http_1 = __importDefault(require("serverless-http"));
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const corsOptions = {
    origin: "http://your-react-app-origin",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,
    optionsSuccessStatus: 204, // Set the response status for successful preflight requests
};
const app = (0, express_1.default)();
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
// app.listen(3000, () => { console.log("Server is running on port 3000") });
const s3Client = new client_s3_1.S3Client({
    region: "ap-south-1",
    credentials: {
        accessKeyId: "AKIA4MTWMLPKWSAW6NB4",
        secretAccessKey: "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",
    },
});
function getSignedUrlForGet(key) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Generating signed URL for:", key);
        try {
            const command = new client_s3_1.GetObjectCommand({
                Bucket: "e-vakeel",
                Key: key,
            });
            const url = yield (0, s3_request_presigner_1.getSignedUrl)(s3Client, command, { expiresIn: 3600 });
            console.log("Generated URL:", url);
            console.log("Generated signed URL for:", key);
            return url;
        }
        catch (error) {
            console.error("Error generating signed URL:", error);
            throw error;
        }
    });
}
// async function getSignedUrlForPut(filename: string, contentType: string): Promise<string> {
//   const command = new PutObjectCommand({
//     Bucket: "e-vakeel",
//     Key: `/user/userID/${filename}`,
//     ContentType: contentType,
//   });
//   const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
//   console.log(url);
//   return url;
// }
function getSignedUrlForPut(filename, contentType) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const command = new client_s3_1.PutObjectCommand({
                Bucket: "e-vakeel",
                Key: `/user/userID/${filename}`,
                ContentType: contentType,
            });
            const url = yield (0, s3_request_presigner_1.getSignedUrl)(s3Client, command, { expiresIn: 3600 });
            console.log(url);
            return url;
        }
        catch (error) {
            console.error("Error generating signed URL for PUT:", error);
            throw error;
        }
    });
}
// printURL();
// getSignedUrlForGet("new.pdf", "application/pdf");
app.post("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let filename = req.body.filename;
        let contentType = req.body.contentType;
        if (!filename || !contentType) {
            return res.status(400).send("Missing filename or contentType");
        }
        const response = yield getSignedUrlForPut(filename, contentType);
        res.status(200).send(response);
    }
    catch (error) {
        console.error('Error generating signed URL:', error);
        res.status(500).send("Error generating signed URL");
    }
}));
app.get("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let filename = req.query.filename;
    if (filename) {
        // const response = await getSignedUrlForGet(filename);
        const response = yield getSignedUrlForGet(filename);
        console.log(response);
        response ? res.status(200).send(response) : res.status(500).send("invalid request or ceredentials");
    }
    return res.status(400).send("filename is required");
}));
// module.exports.handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
//   if (event.bodyevent.body.filename && event.body.contentType) {
//     let filename = event.body.filename;
//     let contentType = event.body.contentType;
//     const response = await getSignedUrlForPut(filename, contentType)
//     return response ? { statusCode: 200, body: response } : { statusCode: 500, body: "invalid request or ceredentials" };
//   }
// }
exports.handler = (0, serverless_http_1.default)(app);
