import {defineField, defineType} from 'sanity'

export const project = defineType({
  name: 'project',
  title: 'פרויקט',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'שם הפרויקט', type: 'string'}),
    defineField({name: 'beforeImage', title: 'לפני', type: 'image', options: {hotspot: true}}),
    defineField({name: 'afterImage', title: 'אחרי', type: 'image', options: {hotspot: true}}),
    defineField({name: 'order', title: 'סדר תצוגה', type: 'number'}),
  ],
})
