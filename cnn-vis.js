// CNN Layer Visualization Simulator
// Takes a source image or canvas, and draws real-time image convolutions, ReLU activations, and Pooling layers.

class CNNVisualizer {
  constructor() {
    this.kernels = {
      edge: [-1, -1, -1, -1, 8, -1, -1, -1, -1], // Ridge/Edge detection kernel
      sharpen: [0, -1, 0, -1, 5, -1, 0, -1, 0],
      emboss: [-2, -1, 0, -1, 1, 1, 0, 1, 2],
      horizontal: [-1, -2, -1, 0, 0, 0, 1, 2, 1], // Sobel horizontal
      vertical: [-1, 0, 1, -2, 0, 2, -1, 0, 1] // Sobel vertical
    };
  }

  // Draw simulated CNN layer processing
  visualize(sourceImg, layerCanvases) {
    const { inputCanvas, convCanvas, reluCanvas, poolCanvas } = layerCanvases;
    if (!inputCanvas || !convCanvas || !reluCanvas || !poolCanvas) return;

    const width = 180;
    const height = 180;

    // Set widths & heights
    [inputCanvas, convCanvas, reluCanvas, poolCanvas].forEach(c => {
      c.width = width;
      c.height = height;
    });

    const ctxIn = inputCanvas.getContext('2d');
    const ctxConv = convCanvas.getContext('2d');
    const ctxRelu = reluCanvas.getContext('2d');
    const ctxPool = poolCanvas.getContext('2d');

    // 1. Draw input image resizing to canvas size
    ctxIn.drawImage(sourceImg, 0, 0, width, height);

    // Get input image data for processing
    const imgData = ctxIn.getImageData(0, 0, width, height);
    
    // 2. Convolution (using a random edge or vertical kernel)
    const convData = this.applyConvolution(imgData, this.kernels.edge);
    ctxConv.putImageData(convData, 0, 0);

    // 3. ReLU (Rectified Linear Unit: threshold pixels, set low values to 0/black)
    const reluData = this.applyReLU(convData, 45); // threshold at 45 intensity
    ctxRelu.putImageData(reluData, 0, 0);

    // 4. MaxPooling (Downsample image by factor of 4x4)
    this.applyMaxPooling(reluCanvas, poolCanvas, 4);
  }

  // Core Convolution processing
  applyConvolution(imgData, kernel) {
    const width = imgData.width;
    const height = imgData.height;
    const src = imgData.data;
    
    // Create new image data container
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const destImageData = ctx.createImageData(width, height);
    const dest = destImageData.data;

    const side = Math.round(Math.sqrt(kernel.length));
    const halfSide = Math.floor(side / 2);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0;

        // Apply kernel matrix
        for (let cy = 0; cy < side; cy++) {
          for (let cx = 0; cx < side; cx++) {
            const scy = Math.min(height - 1, Math.max(0, y + cy - halfSide));
            const scx = Math.min(width - 1, Math.max(0, x + cx - halfSide));
            const srcIdx = (scy * width + scx) * 4;
            const kVal = kernel[cy * side + cx];

            r += src[srcIdx] * kVal;
            g += src[srcIdx + 1] * kVal;
            b += src[srcIdx + 2] * kVal;
          }
        }

        const destIdx = (y * width + x) * 4;
        
        // Add offset to make feature maps visible (e.g. edge detection contrast)
        const intensity = Math.min(255, Math.max(0, (r + g + b) / 3));
        
        // Render in a scientific futuristic cyan/green tone
        dest[destIdx] = 0; // Red channel
        dest[destIdx + 1] = intensity; // Green channel
        dest[destIdx + 2] = intensity * 0.95; // Blue channel
        dest[destIdx + 3] = 255; // Alpha
      }
    }
    return destImageData;
  }

  // ReLU: If pixel color is less than threshold, turn to dark green/black
  applyReLU(imgData, threshold) {
    const src = imgData.data;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const destImageData = ctx.createImageData(imgData.width, imgData.height);
    const dest = destImageData.data;

    for (let i = 0; i < src.length; i += 4) {
      const g = src[i + 1];
      const b = src[i + 2];
      const val = (g + b) / 2;

      if (val > threshold) {
        // High contrast green-cyan highlights
        dest[i] = 0;
        dest[i + 1] = val * 1.2 > 255 ? 255 : val * 1.2;
        dest[i + 2] = val * 1.1 > 255 ? 255 : val * 1.1;
        dest[i + 3] = 255;
      } else {
        // Suppress lower activations to solid black/very deep green
        dest[i] = 0;
        dest[i + 1] = val * 0.15;
        dest[i + 2] = val * 0.1;
        dest[i + 3] = 255;
      }
    }
    return destImageData;
  }

  // MaxPooling: Downsample the canvas, taking the max pixel value in each block
  applyMaxPooling(srcCanvas, destCanvas, poolSize) {
    const srcCtx = srcCanvas.getContext('2d');
    const destCtx = destCanvas.getContext('2d');
    const w = srcCanvas.width;
    const h = srcCanvas.height;

    const imgData = srcCtx.getImageData(0, 0, w, h);
    const pixels = imgData.data;

    destCtx.fillStyle = '#060a0f';
    destCtx.fillRect(0, 0, w, h);

    // Subdivide and draw downsampled blocks
    for (let y = 0; y < h; y += poolSize) {
      for (let x = 0; x < w; x += poolSize) {
        let maxG = 0;
        let maxB = 0;

        // Find max in pool window
        for (let py = 0; py < poolSize; py++) {
          for (let px = 0; px < poolSize; px++) {
            const curY = Math.min(h - 1, y + py);
            const curX = Math.min(w - 1, x + px);
            const idx = (curY * w + curX) * 4;

            if (pixels[idx + 1] > maxG) {
              maxG = pixels[idx + 1];
              maxB = pixels[idx + 2];
            }
          }
        }

        // Draw scaled pixel back
        destCtx.fillStyle = `rgb(0, ${maxG}, ${maxB})`;
        destCtx.fillRect(x, y, poolSize, poolSize);
      }
    }
  }
}

window.CNNVisualizer = CNNVisualizer;
