const { z } = require('zod');

// TODO: replace with real field-level validation for category
const createSchema = z.object({
  body: z.object({}).passthrough(),
});

const updateSchema = z.object({
  body: z.object({}).passthrough(),
  params: z.object({ id: z.string() }),
});

module.exports = { createSchema, updateSchema };
