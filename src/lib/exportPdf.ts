export async function exportToPdf(elementId: string): Promise<void> {
  const el = document.getElementById(elementId);
  if (!el) return;

  const { default: html2canvas } = await import('html2canvas');
  const { default: jsPDF } = await import('jspdf');

  const prevOverflow = el.style.overflow;
  const prevMaxH    = el.style.maxHeight;
  el.style.overflow  = 'visible';
  el.style.maxHeight = 'none';

  try {
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const ratio = canvas.width / canvas.height;
    const imgW  = pageW;
    const imgH  = imgW / ratio;
    pdf.addImage(imgData, 'PNG', 0, 0, imgW, Math.min(imgH, pageH));
    pdf.save(`シフト表_${new Date().toISOString().slice(0, 10)}.pdf`);
  } finally {
    el.style.overflow  = prevOverflow;
    el.style.maxHeight = prevMaxH;
  }
}

export function exportToJson(data: object, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
