// Category configuration with colors, icons and keyword matchers
export const CATEGORY_DEFINITIONS = [
  {
    id: 'Food & Dining',
    name: 'Food & Dining',
    color: '#10B981', // Teal
    isRoutine: true,
    keywords: ['breakfast', 'lunch', 'dinner', 'tea', 'coffee', 'mandi', 'break tea', 'evening tea', 'snack', 'food', 'restaurant', 'cafe']
  },
  {
    id: 'Transportation',
    name: 'Transportation',
    color: '#3B82F6', // Blue
    isRoutine: true,
    keywords: ['uber', 'auto', 'bus', 'train', 'ticket', 'cab', 'travel', 'metro', 'petrol', 'fuel']
  },
  {
    id: 'Shopping & Supplies',
    name: 'Shopping & Supplies',
    color: '#F59E0B', // Amber
    isRoutine: true,
    keywords: ['grocery', 'supermarket', 'stationary', 'print', 'mobile stuff', 'shop', 'clothes', 'items']
  },
  {
    id: 'Housing & Rent',
    name: 'Housing & Rent',
    color: '#F43F5E', // Rose
    isRoutine: false, // Fixed expense
    keywords: ['room rent', 'rent', 'deposit', 'advance', 'room']
  },
  {
    id: 'Fitness & Health',
    name: 'Fitness & Health',
    color: '#8B5CF6', // Purple
    isRoutine: false, // Fixed / Equipment
    keywords: ['gym', 'helmet', 'doctor', 'medicine', 'workout', 'fitness']
  },
  {
    id: 'Utilities & Bills',
    name: 'Utilities & Bills',
    color: '#06B6D4', // Cyan
    isRoutine: true,
    keywords: ['recharge', 'mobile recharge', 'wifi', 'electricity', 'water', 'bill']
  },
  {
    id: 'Transfers & Friends',
    name: 'Transfers & Friends',
    color: '#EC4899', // Pink
    isRoutine: false,
    keywords: ['rahul', 'friend', 'loan', 'transfer', 'given']
  },
  {
    id: 'Others',
    name: 'Others',
    color: '#64748B',
    isRoutine: true,
    keywords: []
  }
];

// Helper to guess category based on expense title
export function autoDetectCategory(title, availableCategories = CATEGORY_DEFINITIONS) {
  const lower = title.toLowerCase().trim();
  for (const cat of availableCategories) {
    if (cat.keywords && cat.keywords.some(kw => lower.includes(kw))) {
      return cat.name;
    }
  }
  return 'Others';
}

// Check if category is classified as Routine Living expense or Major Fixed
export function isRoutineExpense(categoryName, customCategories = []) {
  const allCats = [...CATEGORY_DEFINITIONS, ...customCategories];
  const found = allCats.find(c => c.name === categoryName);
  return found ? (found.isRoutine !== false) : true;
}

// Parse notepad raw text into structured array of expense items
export function parseNotepadText(text, currentYear = 2026) {
  const lines = text.split('\n');
  const results = [];
  let currentDate = null;

  // Month mapping
  const monthNames = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', july: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
  };

  for (let rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Ignore lines that represent totals (e.g. "Total : 692" or "Total : 487 + 3500 = 3987")
    if (/^total\s*[:=]/i.test(line)) {
      continue;
    }

    // Check if line is a Date Header like "July 19 :" or "July 20 :" or "20th July :" or "2026-07-20"
    const dateHeaderMatch = line.match(/^(july|jul|aug|sep|oct|nov|dec|jan|feb|mar|apr|may)\s*(\d{1,2})\s*[:]?/i) ||
                            line.match(/^(\d{1,2})(?:st|nd|rd|th)?\s*(july|jul|aug|sep|oct|nov|dec|jan|feb|mar|apr|may)\s*[:]?/i);

    if (dateHeaderMatch) {
      let monthStr, dayStr;
      if (isNaN(dateHeaderMatch[1])) {
        monthStr = dateHeaderMatch[1].toLowerCase();
        dayStr = dateHeaderMatch[2];
      } else {
        dayStr = dateHeaderMatch[1];
        monthStr = dateHeaderMatch[2].toLowerCase();
      }
      const mm = monthNames[monthStr.substring(0, 3)] || '07';
      const dd = String(dayStr).padStart(2, '0');
      currentDate = `${currentYear}-${mm}-${dd}`;
      continue;
    }

    // Parse expense item line like "Train ticket booked - 222" or "Break tea : 40"
    const itemMatch = line.match(/^(.+?)\s*[-:]\s*(\d+(?:\.\d+)?)$/);
    if (itemMatch && currentDate) {
      const title = itemMatch[1].trim();
      const amount = parseFloat(itemMatch[2]);
      const category = autoDetectCategory(title);

      results.push({
        id: 'imp_' + Math.random().toString(36).substring(2, 9),
        title,
        amount,
        date: currentDate,
        category,
        payment_method: 'UPI/Cash',
        notes: 'Imported from notepad',
        is_fixed: !isRoutineExpense(category)
      });
    }
  }

  return results;
}
