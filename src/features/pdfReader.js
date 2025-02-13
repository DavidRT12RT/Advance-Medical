const fs = require('fs');
const fetch = require('node-fetch');
const FormData = require('form-data'); // Ensure you're using the correct FormData package

async function callPdfApi(apiUrl, pdfPath) {
  try {
    // Read the PDF file
    const pdfFile = fs.createReadStream(pdfPath);

    // Create a FormData object
    const formData = new FormData();
    formData.append('file', pdfFile, pdfPath);

    // Make the POST request
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders ? formData.getHeaders() : {},
    });

    // Check if the response was successful
    if (response.ok) {
      return await response.json(); // Return the response in JSON format
    } else {
      const errorText = await response.text();
      return { error: `Error in API: ${response.status}, ${errorText}` };
    }
  } catch (error) {
    return { error: `Exception calling API: ${error.message}` };
  }
}

// Example usage:
const apiUrl = "https://us-central1-smartroute-ca317.cloudfunctions.net/pdf_txt";
const pdfPath = "D:\SAT-2-3.pdf"; // Path to your PDF file

// Call the function
callPdfApi(apiUrl, pdfPath).then(response => console.log(response));
