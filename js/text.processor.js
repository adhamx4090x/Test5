/**
 * Text Processing Module
 * Handles text parsing, formatting, and manipulation
 */

class TextProcessor {
  constructor(options = {}) {
    this.delimiters = options.delimiters || {
      word: /\s+/,
      sentence: /[.!?]+/,
      paragraph: /\n\n+/,
      line: /\n/
    };
    
    this.formatters = {
      capitalize: (text) => text.charAt(0).toUpperCase() + text.slice(1),
      uppercase: (text) => text.toUpperCase(),
      lowercase: (text) => text.toLowerCase(),
      titleCase: (text) => text.replace(/\w\S*/g, (word) => 
        word.charAt(0).toUpperCase() + word.substr(1).toLowerCase()
      ),
      trim: (text) => text.trim(),
      normalizeSpaces: (text) => text.replace(/\s+/g, ' '),
      removeExtraNewlines: (text) => text.replace(/\n{3,}/g, '\n\n'),
      removeSpecialChars: (text) => text.replace(/[^\w\s.!?]/g, '')
    };
  }

  /**
   * Parse text into words
   */
  parseWords(text) {
    return text
      .split(this.delimiters.word)
      .filter(word => word.length > 0);
  }

  /**
   * Parse text into sentences
   */
  parseSentences(text) {
    return text
      .split(this.delimiters.sentence)
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 0);
  }

  /**
   * Parse text into paragraphs
   */
  parseParagraphs(text) {
    return text
      .split(this.delimiters.paragraph)
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0);
  }

  /**
   * Parse text into lines
   */
  parseLines(text) {
    return text
      .split(this.delimiters.line)
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }

  /**
   * Count words in text
   */
  countWords(text) {
    return this.parseWords(text).length;
  }

  /**
   * Count sentences in text
   */
  countSentences(text) {
    return this.parseSentences(text).length;
  }

  /**
   * Count paragraphs in text
   */
  countParagraphs(text) {
    return this.parseParagraphs(text).length;
  }

  /**
   * Count characters in text
   */
  countCharacters(text, includeSpaces = true) {
    return includeSpaces ? text.length : text.replace(/\s/g, '').length;
  }

  /**
   * Count characters per minute (for speech rate)
   */
  countCharactersPerMinute(text, durationMs) {
    const minutes = durationMs / 60000;
    return Math.round(this.countCharacters(text) / minutes);
  }

  /**
   * Get text statistics
   */
  getStatistics(text) {
    const words = this.parseWords(text);
    const sentences = this.parseSentences(text);
    const paragraphs = this.parseParagraphs(text);
    
    return {
      characters: this.countCharacters(text),
      charactersNoSpaces: this.countCharacters(text, false),
      words: words.length,
      sentences: sentences.length,
      paragraphs: paragraphs.length,
      averageWordLength: words.length > 0 
        ? words.reduce((sum, word) => sum + word.length, 0) / words.length 
        : 0,
      averageSentenceLength: sentences.length > 0
        ? words.length / sentences.length
        : 0
    };
  }

  /**
   * Format text with specified formatter
   */
  format(text, formatterName, ...args) {
    const formatter = this.formatters[formatterName];
    if (!formatter) {
      throw new Error(`Unknown formatter: ${formatterName}`);
    }
    return formatter(text, ...args);
  }

  /**
   * Apply multiple formatters
   */
  formatAll(text, formatterNames) {
    let result = text;
    for (const name of formatterNames) {
      result = this.format(result, name);
    }
    return result;
  }

  /**
   * Convert text to speech-friendly format
   */
  toSpeechFormat(text) {
    return this.formatAll(text, [
      'normalizeSpaces',
      'removeExtraNewlines',
      'capitalize'
    ]);
  }

  /**
   * Convert text to formal format
   */
  toFormalFormat(text) {
    return this.formatAll(text, [
      'normalizeSpaces',
      'removeExtraNewlines',
      'capitalize',
      'removeSpecialChars'
    ]);
  }

  /**
   * Search text for patterns
   */
  search(text, pattern, options = {}) {
    const flags = options.ignoreCase ? 'gi' : 'g';
    const regex = pattern instanceof RegExp 
      ? new RegExp(pattern.source, flags) 
      : new RegExp(this.escapeRegex(pattern), flags);
    
    const matches = [];
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        text: match[0],
        index: match.index,
        length: match[0].length,
        groups: match.slice(1)
      });
    }
    
    return matches;
  }

  /**
   * Escape special regex characters
   */
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Replace text with patterns
   */
  replace(text, pattern, replacement, options = {}) {
    const flags = options.ignoreCase ? 'gi' : 'g';
    const regex = pattern instanceof RegExp 
      ? new RegExp(pattern.source, flags) 
      : new RegExp(this.escapeRegex(pattern), flags);
    
    return text.replace(regex, replacement);
  }

  /**
   * Highlight text with patterns
   */
  highlight(text, pattern, highlightClass = 'highlight') {
    const matches = this.search(text, pattern, { ignoreCase: true });
    
    if (matches.length === 0) {
      return text;
    }

    let result = '';
    let lastIndex = 0;

    for (const match of matches) {
      result += text.slice(lastIndex, match.index);
      result += `<span class="${highlightClass}">${match.text}</span>`;
      lastIndex = match.index + match.length;
    }

    result += text.slice(lastIndex);
    return result;
  }

  /**
   * Extract text between markers
   */
  extractBetween(text, startMarker, endMarker, options = {}) {
    const pattern = new RegExp(
      this.escapeRegex(startMarker) + '(.+?)' + this.escapeRegex(endMarker),
      options.ignoreCase ? 'gi' : 'g'
    );

    const matches = [];
    let match;

    while ((match = pattern.exec(text)) !== null) {
      matches.push(match[1].trim());
    }

    return matches;
  }

  /**
   * Truncate text to specified length
   */
  truncate(text, maxLength, suffix = '...') {
    if (text.length <= maxLength) {
      return text;
    }
    
    const truncated = text.slice(0, maxLength - suffix.length);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + suffix;
  }

  /**
   * Generate text summary
   */
  summarize(text, maxSentences = 3) {
    const sentences = this.parseSentences(text);
    
    if (sentences.length <= maxSentences) {
      return text;
    }

    // Score sentences by position and length
    const scored = sentences.map((sentence, index) => ({
      text: sentence,
      score: (sentences.length - index) * 2 - sentence.length / 10
    }));

    // Sort by score and take top sentences
    scored.sort((a, b) => b.score - a.score);
    const topSentences = scored.slice(0, maxSentences);
    
    // Restore original order
    topSentences.sort((a, b) => 
      sentences.indexOf(a.text) - sentences.indexOf(b.text)
    );

    return topSentences.map(s => s.text).join(' ');
  }

  /**
   * Convert text to fuzzy search format
   */
  toFuzzySearch(text) {
    return text
      .toLowerCase()
      .replace(/\s+/g, '')
      .normalize('NFD');
  }

  /**
   * Calculate similarity between two texts
   */
  similarity(text1, text2) {
    const fuzzy1 = this.toFuzzySearch(text1);
    const fuzzy2 = this.toFuzzySearch(text2);

    if (fuzzy1 === fuzzy2) return 1;
    if (!fuzzy1 || !fuzzy2) return 0;

    // Levenshtein distance based similarity
    const longer = fuzzy1.length > fuzzy2.length ? fuzzy1 : fuzzy2;
    const shorter = fuzzy1.length > fuzzy2.length ? fuzzy2 : fuzzy1;

    if (longer.length === 0) return 1;

    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance
   */
  levenshteinDistance(str1, str2) {
    const m = str1.length;
    const n = str2.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(
            dp[i - 1][j],
            dp[i][j - 1],
            dp[i - 1][j - 1]
          );
        }
      }
    }

    return dp[m][n];
  }

  /**
   * Convert text to different cases
   */
  toCase(text, caseType) {
    switch (caseType) {
      case 'camel':
        return this.toCamelCase(text);
      case 'pascal':
        return this.toPascalCase(text);
      case 'snake':
        return this.toSnakeCase(text);
      case 'kebab':
        return this.toKebabCase(text);
      case 'upper':
        return text.toUpperCase();
      case 'lower':
        return text.toLowerCase();
      default:
        return text;
    }
  }

  /**
   * Convert to camelCase
   */
  toCamelCase(text) {
    const words = this.parseWords(text);
    return words[0].toLowerCase() + words.slice(1).map(w => 
      w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    ).join('');
  }

  /**
   * Convert to PascalCase
   */
  toPascalCase(text) {
    const words = this.parseWords(text);
    return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
  }

  /**
   * Convert to snake_case
   */
  toSnakeCase(text) {
    return this.parseWords(text).join('_').toLowerCase();
  }

  /**
   * Convert to kebab-case
   */
  toKebabCase(text) {
    return this.parseWords(text).join('-').toLowerCase();
  }
}

module.exports = TextProcessor;
