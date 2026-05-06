import { Lesson, Slide } from '@/types/lesson';

export const getSlideTitle = (slideIndex: number, slide: Slide): string => {
  return slide.title || `Slide ${slideIndex + 1}`;
};

export const formatStructuredNotes = (): string => '';

export const openPrintWindow = (lesson: Lesson, schoolLogo?: string, schoolName?: string, brandColors?: { primary: string; secondary: string }) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  const html = generatePrintHTML(lesson, schoolLogo, schoolName, brandColors);
  printWindow.document.write(html);
  printWindow.document.close();
};

export const generatePrintHTML = (lesson: Lesson, schoolLogo?: string, schoolName?: string, brandColors?: { primary: string; secondary: string }): string => {
  const primary = brandColors?.primary || '#7c3aed';
  const secondary = brandColors?.secondary || '#ec4899';
  return `<!DOCTYPE html><html><head><title>${lesson.title} - Lesson Plan</title>${getPrintStyles(primary, secondary)}</head><body>${generateCoverPage(lesson, schoolLogo, schoolName, primary, secondary)}${generateSlidesContent(lesson, primary, secondary)}</body></html>`;
};

const getPrintStyles = (primary: string, secondary: string): string => `<style>
@media print { .page-break { page-break-before: always; } }
body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333; }
.cover { text-align: center; padding: 40px 20px; border: 3px solid ${primary}; border-radius: 12px; margin-bottom: 40px; }
.cover h1 { color: ${primary}; font-size: 28px; margin-bottom: 20px; }
.cover .meta { font-size: 16px; color: #666; margin: 8px 0; }
.school-logo { max-height: 80px; margin-bottom: 20px; }
.school-name { font-size: 20px; color: ${primary}; font-weight: bold; margin-bottom: 10px; }
.metadata { background: ${primary}11; padding: 20px; border-radius: 8px; margin: 20px 0; }
.metadata h3 { color: ${primary}; margin-bottom: 12px; }
.metadata-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.metadata-item { font-size: 14px; }
.metadata-item strong { color: ${primary}; }
.slide { border: 2px solid ${primary}; border-radius: 8px; padding: 20px; margin-bottom: 20px; background: ${primary}08; }
.slide-header { background: linear-gradient(to right, ${primary}, ${secondary}); color: white; padding: 12px 16px; border-radius: 6px; margin-bottom: 15px; }
.slide-header h2 { margin: 0; font-size: 18px; font-weight: bold; }
.section { margin-bottom: 15px; padding: 12px; background: white; border-radius: 6px; border-left: 4px solid ${primary}; }
.section h3 { color: ${primary}; font-size: 14px; margin-bottom: 8px; font-weight: bold; }
.section p { margin: 5px 0; font-size: 14px; line-height: 1.6; }
.print-btn { position: fixed; top: 20px; right: 20px; background: ${primary}; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 16px; }
.print-btn:hover { opacity: 0.9; }
@media print { .print-btn { display: none; } }
</style>`;

const generateCoverPage = (lesson: Lesson, schoolLogo?: string, schoolName?: string, primary?: string, secondary?: string): string => {
  const curriculum = lesson.curriculumInfo;
  const logoHtml = schoolLogo ? `<img src="${schoolLogo}" alt="School Logo" class="school-logo" />` : '';
  const schoolNameHtml = schoolName ? `<div class="school-name">${schoolName}</div>` : '';
  return `
<button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
<div class="cover">
  ${logoHtml}
  ${schoolNameHtml}
  <h1>${lesson.title}</h1>
  <p class="meta"><strong>Subject:</strong> ${lesson.subject}</p>
  <p class="meta"><strong>Class Level:</strong> ${lesson.class || 'Not specified'}</p>
  <p class="meta"><strong>Week:</strong> Week ${lesson.week}</p>
  <p class="meta"><strong>Lesson Number:</strong> Lesson ${lesson.lessonNumber}</p>
  <p class="meta"><strong>Duration:</strong> ${lesson.duration}</p>
</div>
${curriculum ? `
<div class="metadata">
  <div class="metadata-grid">
    ${curriculum.strandName ? `<div class="metadata-item"><strong>Strand:</strong> ${curriculum.strandName}</div>` : ''}
    ${curriculum.subStrandName ? `<div class="metadata-item"><strong>Sub Strand:</strong> ${curriculum.subStrandName}</div>` : ''}
    ${curriculum.contentStandardCode ? `<div class="metadata-item"><strong>Content Standard:</strong> ${curriculum.contentStandardCode}</div>` : ''}
  </div>
  ${curriculum.contentStandardDesc ? `<p class="metadata-item" style="margin-top:10px"><strong>Description:</strong> ${curriculum.contentStandardDesc}</p>` : ''}
  ${curriculum.indicatorDetails?.length ? `<p class="metadata-item"><strong>Indicators:</strong> ${curriculum.indicatorDetails.map(i => i.code).join(', ')}</p>` : ''}
  ${curriculum.coreCompetences?.length ? `<p class="metadata-item"><strong>Core Competences:</strong> ${curriculum.coreCompetences.join(', ')}</p>` : ''}
</div>` : ''}
<div class="page-break"></div>`;
};


const generateSlidesContent = (lesson: Lesson, primary?: string, secondary?: string): string => {
  return lesson.slides.map((slide, index) => {
    const title = getSlideTitle(index, slide);
    return `<div class="slide ${index > 0 ? 'page-break' : ''}">
      <div class="slide-header"><h2>Slide ${index + 1}: ${title}</h2></div>
      <div class="section"><h3>Content</h3><p>${slide.content || 'No content'}</p></div>
    </div>`;
  }).join('');
};
