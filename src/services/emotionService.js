/**
 * MoodVision AI - Emotion Service
 * Handles API communication with server-side computer vision models
 * and provides expression metadata and color mapping.
 */

export const EMOTIONS = [
  'Happy',
  'Sad',
  'Neutral',
  'Angry',
  'Surprised',
  'Fearful',
  'Disgusted',
];

export const EMOTION_CONFIG = {
  Happy: {
    label: 'Happy',
    emoji: '😊',
    color: '#10B981', // emerald-500
    badgeBg: 'bg-emerald-500/15',
    badgeText: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    gradient: 'from-emerald-500 to-teal-400',
    glowColor: 'rgba(16, 185, 129, 0.3)',
    description: 'Elevated lip corners, cheek raise, and relaxed forehead aperture.',
  },
  Sad: {
    label: 'Sad',
    emoji: '😔',
    color: '#6366F1', // indigo-500
    badgeBg: 'bg-indigo-500/15',
    badgeText: 'text-indigo-400',
    borderColor: 'border-indigo-500/30',
    gradient: 'from-indigo-500 to-blue-400',
    glowColor: 'rgba(99, 102, 241, 0.3)',
    description: 'Drooping mouth corners, inner brow elevation, and lowered eyelids.',
  },
  Neutral: {
    label: 'Neutral',
    emoji: '😐',
    color: '#38BDF8', // sky-400
    badgeBg: 'bg-sky-500/15',
    badgeText: 'text-sky-400',
    borderColor: 'border-sky-500/30',
    gradient: 'from-sky-500 to-cyan-400',
    glowColor: 'rgba(56, 189, 248, 0.3)',
    description: 'Balanced facial musculature with no pronounced expressive tension.',
  },
  Angry: {
    label: 'Angry',
    emoji: '😠',
    color: '#F43F5E', // rose-500
    badgeBg: 'bg-rose-500/15',
    badgeText: 'text-rose-400',
    borderColor: 'border-rose-500/30',
    gradient: 'from-rose-500 to-amber-500',
    glowColor: 'rgba(244, 63, 94, 0.3)',
    description: 'Lowered and pulled-together eyebrows, tightened eyelids, and pressed lips.',
  },
  Surprised: {
    label: 'Surprised',
    emoji: '😲',
    color: '#A855F7', // purple-500
    badgeBg: 'bg-purple-500/15',
    badgeText: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    gradient: 'from-purple-500 to-pink-500',
    glowColor: 'rgba(168, 85, 247, 0.3)',
    description: 'Raised curved eyebrows, widened eye aperture, and parted lips/jaw drop.',
  },
  Fearful: {
    label: 'Fearful',
    emoji: '😨',
    color: '#F59E0B', // amber-500
    badgeBg: 'bg-amber-500/15',
    badgeText: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    gradient: 'from-amber-500 to-orange-500',
    glowColor: 'rgba(245, 158, 11, 0.3)',
    description: 'Raised straight eyebrows, tense lower eyelids, and horizontally retracted lips.',
  },
  Disgusted: {
    label: 'Disgusted',
    emoji: '🤢',
    color: '#14B8A6', // teal-500
    badgeBg: 'bg-teal-500/15',
    badgeText: 'text-teal-400',
    borderColor: 'border-teal-500/30',
    gradient: 'from-teal-500 to-emerald-400',
    glowColor: 'rgba(20, 184, 166, 0.3)',
    description: 'Wrinkled nose bridge, raised upper lip, and squinting eyelids.',
  },
};

/**
 * Sends image data to backend for AI facial expression analysis.
 * @param {string} imageBase64 - Base64 string or Data URL
 * @param {string} mimeType - Image mime type
 * @returns {Promise<Object>} Analysis result
 */
export async function analyzeFacialExpression(imageBase64, mimeType = 'image/jpeg') {
  if (!imageBase64) {
    throw new Error('Please select or capture a photo first.');
  }

  const response = await fetch('/api/analyze-expression', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: imageBase64,
      mimeType,
    }),
  });

  const result = await response.json().catch(() => {
    throw new Error(`Failed to parse server response (HTTP ${response.status}).`);
  });

  if (!response.ok || !result.success) {
    const errorMsg = result?.error || `Analysis failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return result.data;
}

/**
 * Downloads a structured JSON or text report of the analysis.
 */
export function downloadAnalysisReport(data, filename = 'MoodVision-AI-Analysis.json') {
  const exportPayload = {
    application: 'MoodVision AI',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    analysis: data,
  };

  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
