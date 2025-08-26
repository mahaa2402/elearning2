// backend/routes/Videofetch.js
const express = require("express");
const AWS = require("aws-sdk");

const router = express.Router(); // ✅ define router

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
});

const BUCKET = process.env.AWS_BUCKET_NAME;
const TTL = parseInt(process.env.VIDEO_URL_TTL_SECONDS || "3600", 10);

// ✅ sanitize course names for safety
const sanitize = (s) => (s || "").replace(/[^a-zA-Z0-9 _-]/g, "").trim();

router.get("/get", async (req, res) => {
  try {
    const courseNameRaw = req.query.courseName;
    const moduleIndexRaw = req.query.moduleIndex;

    if (!courseNameRaw || moduleIndexRaw == null) {
      return res
        .status(400)
        .json({ error: "courseName and moduleIndex are required" });
    }

    const courseName = sanitize(courseNameRaw);
    const moduleIndex = Number(moduleIndexRaw); // keep raw index
    const moduleNumber = moduleIndex + 1; // user-friendly module number

    if (!Number.isFinite(moduleIndex) || moduleIndex < 0) {
      return res.status(400).json({ error: "Invalid moduleIndex" });
    }

    // ✅ S3 path: e-learning/videos/{courseName}/Module{N}/
    const prefix = `e-learning/videos/${courseName}/Module${moduleNumber}/`;

    console.log("🔎 Looking in S3 prefix:", prefix);

    const list = await s3
      .listObjectsV2({
        Bucket: BUCKET,
        Prefix: prefix,
      })
      .promise();

    console.log("✅ S3 list result count:", list.Contents?.length || 0);

    if (!list.Contents || list.Contents.length === 0) {
      return res
        .status(404)
        .json({ error: "No files in S3", lookedIn: prefix });
    }

    // ✅ Filter only video files
    const candidates = list.Contents.filter((o) =>
      /\.(mp4|webm|mov|m4v)$/i.test(o.Key)
    );

    if (!candidates.length) {
      return res
        .status(404)
        .json({ error: "No video files found", files: list.Contents });
    }

    // ✅ Pick most recently modified
    candidates.sort(
      (a, b) => new Date(b.LastModified) - new Date(a.LastModified)
    );
    const chosen = candidates[0];

    console.log("🎬 Chosen file:", chosen.Key);

    // ✅ Generate signed URL
    const signedUrl = s3.getSignedUrl("getObject", {
      Bucket: BUCKET,
      Key: chosen.Key,
      Expires: TTL,
    });

    return res.json({ success: true, url: signedUrl });
  } catch (err) {
    console.error("❌ Backend crashed while fetching video:", err.stack || err);
    return res.status(500).json({
      error: "Server error",
      details: err.message,
      stack: err.stack,
    });
  }
});

module.exports = router; // ✅ export router
