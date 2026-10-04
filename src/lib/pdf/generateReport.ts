import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FullEvaluationRecord } from '../agents/types';

export interface BatchSummaryData {
  id: string;
  name: string;
  totalRecords: number;
  successfulRecords: number;
  failedRecords: number;
  passCount: number;
  needsImprovementCount: number;
  failCount: number;
  avgOverallScore: number;
  avgRelevance: number;
  avgAccuracy: number;
  avgHallucination: number;
  avgCompleteness: number;
  aiSystem: string;
  createdAt: string;
  records?: FullEvaluationRecord[];
}

export function generateSingleEvaluationPdf(record: FullEvaluationRecord): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor: [number, number, number] = [36, 68, 231];
  const darkColor: [number, number, number] = [15, 23, 42];
  const grayColor: [number, number, number] = [100, 116, 139];
  const passColor: [number, number, number] = [22, 163, 74];
  const warnColor: [number, number, number] = [217, 119, 6];
  const failColor: [number, number, number] = [220, 38, 38];

  let verdictColor: [number, number, number] = passColor;
  if (record.verdict === 'NEEDS IMPROVEMENT') verdictColor = warnColor;
  if (record.verdict === 'FAIL') verdictColor = failColor;

  // Header Bar
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('AI Quality Intelligence Platform', 14, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Infosys Project - Evaluation Audit Report', 130, 15);

  let y = 34;

  // Title & Metadata Card
  doc.setTextColor(...darkColor);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Evaluation Audit Report', 14, y);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text(`Evaluation ID: ${record.id}`, 14, y + 6);
  doc.text(`Timestamp: ${new Date(record.createdAt).toUTCString()}`, 14, y + 11);
  doc.text(`System Evaluated: ${record.aiSystem || 'AI Model'}`, 130, y + 6);
  doc.text(`Confidence Rating: ${(record.confidence * 100).toFixed(0)}%`, 130, y + 11);

  y += 18;

  // Executive Score Summary Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, 182, 32, 3, 3, 'FD');

  // Overall Score & Verdict
  doc.setFontSize(10);
  doc.setTextColor(...grayColor);
  doc.text('COMPOSITE SCORE', 22, y + 10);

  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text(`${record.overallScore}/100`, 22, y + 24);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text('VERDICT', 80, y + 10);

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...verdictColor);
  doc.text(record.verdict, 80, y + 22);

  // Four Pillar Metrics
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkColor);
  doc.text(`Relevance: ${record.relevanceScore}/100`, 140, y + 10);
  doc.text(`Accuracy: ${record.accuracyScore}/100`, 140, y + 16);
  doc.text(`Hallucination Safety: ${record.hallucinationScore}/100`, 140, y + 22);
  doc.text(`Completeness: ${record.completenessScore}/100`, 140, y + 28);

  y += 38;

  // Prompt & Response Section
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkColor);
  doc.text('1. Evaluated Prompt & Response', 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    theme: 'grid',
    head: [['Attribute', 'Content']],
    body: [
      ['Question', record.question],
      ['AI Response', record.aiResponse],
      ['Reference Answer', record.referenceAnswer || 'None provided (Evaluated against RAG knowledge base)'],
    ],
    headStyles: { fillColor: primaryColor, textColor: 255 },
    columnStyles: {
      0: { cellWidth: 32, fontStyle: 'bold', textColor: darkColor },
      1: { cellWidth: 146 },
    },
    styles: { fontSize: 8.5, cellPadding: 3 },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // Multi-Agent Findings Table
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkColor);
  doc.text('2. Multi-Agent Dimension Findings', 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    theme: 'striped',
    head: [['Judge Agent', 'Score', 'Status / Category', 'Key Agent Reasoning']],
    body: [
      ['Relevance Judge', `${record.relevanceScore}%`, record.relevanceData?.category || 'Evaluated', record.relevanceData?.reasoning || ''],
      ['Accuracy Judge', `${record.accuracyScore}%`, record.accuracyScore >= 80 ? 'High Accuracy' : 'Issues Detected', record.accuracyData?.reasoning || ''],
      ['Hallucination Agent', `${record.hallucinationScore}%`, `${record.hallucinationData?.hallucinationCount || 0} Flagged Claims`, record.hallucinationData?.reasoning || ''],
      ['Completeness Judge', `${record.completenessScore}%`, `${record.completenessData?.addressedAspects?.length || 0}/${record.completenessData?.totalRequirements || 0} Addressed`, record.completenessData?.reasoning || ''],
    ],
    headStyles: { fillColor: darkColor, textColor: 255 },
    columnStyles: {
      0: { cellWidth: 35, fontStyle: 'bold' },
      1: { cellWidth: 18, halign: 'center' },
      2: { cellWidth: 32 },
      3: { cellWidth: 97 },
    },
    styles: { fontSize: 8, cellPadding: 3 },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  if (y > 220) {
    doc.addPage();
    y = 20;
  }

  // Hallucination Claims Breakdown
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkColor);
  doc.text('3. Hallucination Claim Audit & Grounding Evidence', 14, y);
  y += 4;

  const claimRows = (record.hallucinationData?.claims || []).map((c, i) => [
    `#${i + 1}`,
    c.text,
    c.status,
    c.severity,
    c.evidence || c.reasoning,
  ]);

  if (claimRows.length > 0) {
    autoTable(doc, {
      startY: y,
      theme: 'grid',
      head: [['ID', 'AI Proposition / Claim', 'Status', 'Severity', 'Evidence / Verification']],
      body: claimRows,
      headStyles: { fillColor: primaryColor, textColor: 255 },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 62 },
        2: { cellWidth: 24, fontStyle: 'bold' },
        3: { cellWidth: 20 },
        4: { cellWidth: 66 },
      },
      styles: { fontSize: 7.5, cellPadding: 2.5 },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  if (y > 230) {
    doc.addPage();
    y = 20;
  }

  // AI Quality Improvement Coach Recommendations
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkColor);
  doc.text('4. AI Quality Improvement Coach Recommendations', 14, y);
  y += 6;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkColor);

  const recommendations = record.recommendations && record.recommendations.length > 0
    ? record.recommendations
    : ['Maintain existing prompt templates; output demonstrates superior factual grounding.'];

  for (const rec of recommendations) {
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, y, 182, 10, 2, 2, 'F');
    doc.text(`* ${rec.substring(0, 115)}`, 18, y + 6);
    y += 13;
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  }

  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...grayColor);
    doc.text(
      `AI Response Validation & Quality Intelligence Platform | Infosys Internship Project | Page ${i} of ${pageCount}`,
      14,
      290
    );
  }

  return doc;
}

export function generateBatchEvaluationPdf(batch: BatchSummaryData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor: [number, number, number] = [36, 68, 231];
  const darkColor: [number, number, number] = [15, 23, 42];
  const grayColor: [number, number, number] = [100, 116, 139];

  // Header Bar
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('AI Quality Intelligence Platform', 14, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Batch Quality & Benchmark Report', 140, 15);

  let y = 34;

  // Title
  doc.setTextColor(...darkColor);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`Batch Evaluation Report: ${batch.name}`, 14, y);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text(`Batch ID: ${batch.id}`, 14, y + 6);
  doc.text(`Generated: ${new Date().toUTCString()}`, 14, y + 11);
  doc.text(`Target AI System: ${batch.aiSystem}`, 130, y + 6);
  doc.text(`Total Records: ${batch.totalRecords} (Success: ${batch.successfulRecords}, Failed: ${batch.failedRecords})`, 130, y + 11);

  y += 20;

  // KPI Summary Cards
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, 182, 34, 3, 3, 'F');

  doc.setFontSize(9);
  doc.setTextColor(...grayColor);
  doc.text('AVG SCORE', 22, y + 10);
  doc.text('PASS COUNT', 65, y + 10);
  doc.text('NEEDS IMPR.', 108, y + 10);
  doc.text('FAIL COUNT', 152, y + 10);

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text(`${batch.avgOverallScore.toFixed(1)}/100`, 22, y + 24);

  doc.setTextColor(22, 163, 74);
  doc.text(`${batch.passCount}`, 65, y + 24);

  doc.setTextColor(217, 119, 6);
  doc.text(`${batch.needsImprovementCount}`, 108, y + 24);

  doc.setTextColor(220, 38, 38);
  doc.text(`${batch.failCount}`, 152, y + 24);

  y += 44;

  // Dimension Scores Table
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkColor);
  doc.text('1. Dimension Quality Aggregates', 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    theme: 'grid',
    head: [['Evaluation Dimension', 'Average Score', 'Benchmark Target', 'Batch Health Status']],
    body: [
      ['Relevance', `${batch.avgRelevance.toFixed(1)}%`, '>= 80%', batch.avgRelevance >= 80 ? 'Healthy' : 'Needs Optimization'],
      ['Accuracy', `${batch.avgAccuracy.toFixed(1)}%`, '>= 85%', batch.avgAccuracy >= 85 ? 'Healthy' : 'Factual Discrepancies'],
      ['Hallucination Safety', `${batch.avgHallucination.toFixed(1)}%`, '>= 85%', batch.avgHallucination >= 85 ? 'High Grounding' : 'Elevated Hallucinations'],
      ['Completeness', `${batch.avgCompleteness.toFixed(1)}%`, '>= 80%', batch.avgCompleteness >= 80 ? 'Comprehensive' : 'Missing Facets'],
    ],
    headStyles: { fillColor: primaryColor, textColor: 255 },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { fontStyle: 'bold' },
    },
    styles: { fontSize: 8.5, cellPadding: 3 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // Evaluated Records Summary Table
  if (batch.records && batch.records.length > 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkColor);
    doc.text('2. Evaluated Sample Records Breakdown', 14, y);
    y += 4;

    const rows = batch.records.slice(0, 15).map((r, i) => [
      `#${i + 1}`,
      r.question.length > 45 ? r.question.substring(0, 45) + '...' : r.question,
      `${r.overallScore}%`,
      r.verdict,
      `${r.accuracyScore}%`,
      `${r.hallucinationScore}%`,
    ]);

    autoTable(doc, {
      startY: y,
      theme: 'striped',
      head: [['#', 'Prompt / Question', 'Score', 'Verdict', 'Accuracy', 'Hal. Safety']],
      body: rows,
      headStyles: { fillColor: darkColor, textColor: 255 },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 80 },
        2: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
        3: { cellWidth: 32, fontStyle: 'bold' },
        4: { cellWidth: 20, halign: 'center' },
        5: { cellWidth: 20, halign: 'center' },
      },
      styles: { fontSize: 8, cellPadding: 2.5 },
    });
  }

  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...grayColor);
    doc.text(
      `AI Response Validation & Quality Intelligence Platform | Batch Summary Report | Page ${i} of ${pageCount}`,
      14,
      290
    );
  }

  return doc;
}
