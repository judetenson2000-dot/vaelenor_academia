/**
 * Exports a chart SVG element as High-Resolution PNG (300 DPI / 3x multiplier) or Vector SVG.
 */
export async function exportChartAsPng(containerElementId: string, filename = 'vaelenor-graph-highres.png'): Promise<void> {
  const container = document.getElementById(containerElementId);
  if (!container) {
    throw new Error(`Chart container #${containerElementId} not found`);
  }

  const svgElement = container.querySelector('svg');
  if (!svgElement) {
    throw new Error('No SVG chart found inside container');
  }

  // Clone SVG to modify without mutating DOM
  const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
  
  // Ensure width and height are explicitly defined
  const bbox = svgElement.getBoundingClientRect();
  const width = bbox.width || 800;
  const height = bbox.height || 450;
  
  clonedSvg.setAttribute('width', `${width}`);
  clonedSvg.setAttribute('height', `${height}`);
  clonedSvg.setAttribute('style', 'background-color: #ffffff;');

  // Inject white background rect as first child so transparent backgrounds don't export black
  const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bgRect.setAttribute('width', '100%');
  bgRect.setAttribute('height', '100%');
  bgRect.setAttribute('fill', '#ffffff');
  clonedSvg.insertBefore(bgRect, clonedSvg.firstChild);

  const xmlSerializer = new XMLSerializer();
  const svgString = xmlSerializer.serializeToString(clonedSvg);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  const image = new Image();
  image.crossOrigin = 'anonymous';

  return new Promise((resolve, reject) => {
    image.onload = () => {
      // 3x resolution for high-res 300 DPI print quality
      const scale = 3;
      const canvas = document.createElement('canvas');
      canvas.width = width * scale;
      canvas.height = height * scale;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Canvas 2D context not available'));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(scale, scale);
      ctx.drawImage(image, 0, 0, width, height);

      URL.revokeObjectURL(url);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas to Blob conversion failed'));
            return;
          }
          const downloadUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(downloadUrl);
          resolve();
        },
        'image/png',
        1.0
      );
    };

    image.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG into image object'));
    };

    image.src = url;
  });
}

export function exportChartAsSvg(containerElementId: string, filename = 'vaelenor-graph-vector.svg'): void {
  const container = document.getElementById(containerElementId);
  if (!container) {
    throw new Error(`Chart container #${containerElementId} not found`);
  }

  const svgElement = container.querySelector('svg');
  if (!svgElement) {
    throw new Error('No SVG chart found inside container');
  }

  const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
  clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  
  const xmlSerializer = new XMLSerializer();
  const svgString = '<?xml version="1.0" standalone="no"?>\r\n' + xmlSerializer.serializeToString(clonedSvg);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const downloadUrl = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}
