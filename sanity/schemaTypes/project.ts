import {defineArrayMember, defineField, defineType} from 'sanity'
import {BodyInput} from '../components/BodyInput'

// Hebrew → Latin transliteration for slugs. Hebrew in a URL path gets
// percent-encoded and the round-trip back to `slug.current == $slug` is
// fragile, so slugs are kept pure ASCII. Without niqqud ב/פ are ambiguous
// (b/v, p/f); we use b and p, and f for final ף.
const HEBREW_TO_LATIN: Record<string, string> = {
  'א': 'a',
  'ב': 'b',
  'ג': 'g',
  'ד': 'd',
  'ה': 'h',
  'ו': 'v',
  'ז': 'z',
  'ח': 'ch',
  'ט': 't',
  'י': 'y',
  'כ': 'k',
  'ך': 'k',
  'ל': 'l',
  'מ': 'm',
  'ם': 'm',
  'נ': 'n',
  'ן': 'n',
  'ס': 's',
  'ע': '',
  'פ': 'p',
  'ף': 'f',
  'צ': 'tz',
  'ץ': 'tz',
  'ק': 'k',
  'ר': 'r',
  'ש': 'sh',
  'ת': 't',
}

function slugifyTitle(input: string): string {
  const slug = input
    // NFKD splits Latin accents into combining marks; those and Hebrew
    // niqqud/cantillation are dropped.
    .normalize('NFKD')
    .replace(/[\u0300-\u036f\u0591-\u05C7]/g, '')
    .replace(/[\u05D0-\u05EA]/g, (ch) => HEBREW_TO_LATIN[ch] ?? '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
    .replace(/-+$/g, '')
  return slug || `project-${Date.now().toString(36)}`
}

export const project = defineType({
  name: 'project',
  title: 'פרויקט',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'שם הפרויקט',
      description: 'שם הפרויקט — יוצג ברשת בעמוד הראשי ובראש עמוד הפרויקט.',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'קישור (Slug)',
      description: 'כתובת העמוד באתר. מלא קודם את שם הפרויקט, ואז לחץ על Generate.',
      type: 'slug',
      options: {
        source: 'title',
        // Transliterate Hebrew to Latin so Generate always yields a non-empty,
        // ASCII-only slug (see slugifyTitle above).
        slugify: slugifyTitle,
        // The default uniqueness check queries the dataset on every keystroke;
        // when that request hangs it destabilizes the whole form. Slugs are
        // authored by hand here, so skip the network round-trip.
        isUnique: () => true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'coverImage',
      title: 'תמונת שער',
      description: 'תמונת השער שתוצג בריבוע ברשת בעמוד הראשי.',
      type: 'image',
      options: {hotspot: true},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'סדר תצוגה',
      description: 'מספר שקובע את סדר ההצגה ברשת (מספר קטן יותר = מוצג קודם).',
      type: 'number',
    }),
    defineField({
      name: 'textAlign',
      title: 'יישור טקסט',
      description: 'בחר את יישור הטקסט בעמוד הפרויקט. משפיע רק על הטקסט — תמונות ובלוקי לפני/אחרי נשארים במרכז.',
      type: 'string',
      options: {
        list: [
          {title: 'ימין (ברירת מחדל)', value: 'right'},
          {title: 'ממורכז', value: 'center'},
          {title: 'מלא (justify)', value: 'justify'},
        ],
        layout: 'radio',
      },
      initialValue: 'right',
    }),
    defineField({
      name: 'body',
      title: 'תוכן הפרויקט',
      description: 'תוכן עמוד הפרויקט: אפשר להוסיף טקסט, תמונות ובלוקים של לפני/אחרי, בכל סדר שתרצה.',
      type: 'array',
      // Stops the editor's selection echo from closing a block's edit dialog
      // on every keystroke / upload (see BodyInput).
      components: {input: BodyInput},
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            {title: 'טקסט רגיל', value: 'normal'},
            {title: 'כותרת', value: 'h2'},
            {title: 'כותרת משנה', value: 'h3'},
          ],
          lists: [
            {title: 'רשימה', value: 'bullet'},
            {title: 'רשימה ממוספרת', value: 'number'},
          ],
          marks: {
            decorators: [
              {title: 'מודגש', value: 'strong'},
              {title: 'נטוי', value: 'em'},
            ],
          },
        }),
        defineArrayMember({type: 'contentImage'}),
        defineArrayMember({type: 'beforeAfter'}),
      ],
    }),
  ],
  preview: {
    select: {title: 'title', media: 'coverImage'},
  },
})
