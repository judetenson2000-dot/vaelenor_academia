import html2pdf from 'html2pdf.js';

export interface ExportPdfOptions {
  elementId?: string;
  filename?: string;
  onStart?: () => void;
  onSuccess?: () => void;
  onError?: (err: Error) => void;
}

export async function exportPaperToPdf({
  elementId = 'paper-content',
  filename = 'Vaelenor_IEEE_Report.pdf',
  onStart,
  onSuccess,
  onError,
}: ExportPdfOptions = {}): Promise<void> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found in DOM`);
    }

    if (onStart) onStart();

    const opt = {
      margin: [8, 8, 8, 8] as [number, number, number, number],
      filename,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        logging: false,
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait' as const,
        compress: true,
      },
      pagebreak: {
        mode: ['avoid-all', 'css', 'legacy'],
      },
    };

    await html2pdf().from(element).set(opt).save();

    if (onSuccess) onSuccess();
  } catch (err: any) {
    console.error('PDF export failed:', err);
    if (onError) onError(err instanceof Error ? err : new Error(String(err)));
    else throw err;
  }
}
