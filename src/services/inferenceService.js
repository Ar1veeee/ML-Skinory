const tf = require("@tensorflow/tfjs-node");
const InputError = require("../exceptions/inputError");

async function predictClassification(model, image, threshold = 0.5) {
  try {
    // Validasi input
    if (!image) {
      throw new InputError("Input gambar tidak valid atau kosong.");
    }

    // Preprocess input image
    const tensor = tf.node
      .decodeJpeg(image) // Decode JPEG file
      .resizeNearestNeighbor([224, 224]) // Resize sesuai input shape model
      .expandDims() // Tambahkan batch dimension
      .toFloat();

    // Normalisasi pixel ke rentang [0, 1]
    const normalizedTensor = tensor.div(tf.scalar(255));

    // Get model prediction
    const prediction = model.predict(normalizedTensor);
    const scores = Array.from(await prediction.data()); // Ambil hasil prediksi sebagai array

    // Debug untuk memastikan keluaran
    console.log("Prediction Scores:", scores);

    // Validasi output
    if (scores.length !== 3) {
      throw new InputError(
        "Output model tidak sesuai, harus berupa array dengan panjang 3."
      );
    }

    // Cari label dengan probabilitas tertinggi
    const labels = ["oily", "normal", "dry"];
    const maxScoreIndex = scores.indexOf(Math.max(...scores));
    const label = labels[maxScoreIndex];

    // Confidence score dari hasil prediksi
    const confidenceScore = scores[maxScoreIndex] * 100; // Konversi ke persentase

    // Saran berdasarkan hasil klasifikasi
    const suggestions = {
      oily: "Gunakan produk perawatan kulit untuk kulit berminyak dan kontrol minyak.",
      normal: "Pertahankan perawatan kulit harian Anda untuk menjaga keseimbangan.",
      dry: "Gunakan pelembap yang sesuai dan hindari produk yang menyebabkan kekeringan.",
    };

    // Kembalikan hasil sebagai objek
    return {
      confidenceScore: confidenceScore.toFixed(1), // Batasi ke 1 desimal
      label,
      suggestion: suggestions[label],
    };
  } catch (error) {
    throw new InputError("Prediksi gagal: " + error.message);
  }
}

module.exports = predictClassification;
