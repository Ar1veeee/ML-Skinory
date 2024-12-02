const axios = require("axios");
const InputError = require("../exceptions/inputError");

async function fetchImageFromUrl(url) {
  try {
    if (!url) {
      throw new InputError("URL gambar tidak valid.");
    }

    const response = await axios({
      method: "get",
      url: url,
      responseType: "arraybuffer",
    });

    return response.data;
  } catch (error) {
    throw new InputError(`Gagal mengambil file dari URL: ${error.message}`);
  }
}

module.exports = fetchImageFromUrl;
