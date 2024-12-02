const loadModel = require("../services/loadModel");
const predictClassification = require("../services/inferenceService");
const fetchImageFromUrl = require("../services/fetchImageFromUrl");
const InputError = require("../exceptions/inputError");
const { v4: uuidv4 } = require("uuid");
const storeData = require("../services/storeData");

async function postPredictHandler(req, res) {
  try {
    const { imageUrl } = req.body; // Mengambil URL gambar dari request body

    // Validasi input
    if (!imageUrl) {
      return res.status(400).json({
        status: "fail",
        message: "URL gambar tidak disediakan.",
      });
    }

    // Mengambil file gambar dari URL
    const image = await fetchImageFromUrl(imageUrl);

    // Memuat model
    const model = await loadModel();

    // Melakukan prediksi
    const predictionResult = await predictClassification(model, image);

    // Menghasilkan ID unik untuk data prediksi
    const id = uuidv4();

    // Menyimpan hasil prediksi ke Firestore
    const predictionData = {
      id: id,
      result: predictionResult.label,
      suggestion: predictionResult.suggestion,
      createdAt: new Date().toISOString(),
    };

    await storeData(id, predictionData);

    // Respon ke pengguna
    const response = {
      status: "success",
      message: "Prediksi berhasil dilakukan.",
      data: {
        id: id,
        result: predictionResult.label,
        suggestion: predictionResult.suggestion,
        createdAt: new Date().toISOString(),
      },
    };

    return res.json(response);
  } catch (error) {
    console.error(error);

    if (error instanceof InputError) {
      return res.status(400).json({
        status: "fail",
        message: error.message,
      });
    }

    return res.status(500).json({
      status: "fail",
      message: "Terjadi kesalahan pada server.",
    });
  }
}

module.exports = { postPredictHandler };
