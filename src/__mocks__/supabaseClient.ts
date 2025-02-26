export const supabase = {
  from: jest.fn(() => ({
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn().mockResolvedValue({
          data: { id: '123', name: 'Sample Match' },
          error: null,
        }),
      })),
    })),
    select: jest.fn(() => ({
      eq: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: '123', name: 'Sample Match' },
        error: null,
      }),
    })),
    update: jest.fn(() => ({
      eq: jest.fn().mockReturnThis(),
      select: jest.fn(() => ({
        single: jest.fn().mockResolvedValue({
          data: { id: '123', name: 'Updated Match' },
          error: null,
        }),
      })),
    })),
    delete: jest.fn(() => ({
      eq: jest.fn().mockReturnThis(),
      select: jest.fn(() => ({
        single: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      })),
    })),
  })),
};
