import { describe, it, expect } from '@jest/globals'
import { 
  profileSchema, 
  profileSessionSchema, 
  ETHNICITY_OPTIONS, 
  RATING_OPTIONS 
} from '@/lib/validations/profile'

describe('Profile Validation Schema', () => {
  describe('profileSchema', () => {
    describe('firstName validation', () => {
      it('should accept valid names', () => {
        const validNames = [
          'John',
          'Mary-Jane',
          "O'Connor",
          'Jean Marie',
          'Ana Sofia',
          'Li Wei'
        ]
        
        validNames.forEach(name => {
          const result = profileSchema.safeParse({
            firstName: name,
            age: 25,
            rating: 7.5
          })
          expect(result.success).toBe(true)
          if (result.success) {
            // Check that name is properly formatted (title case)
            expect(result.data.firstName).toMatch(/^[A-Z]/)
          }
        })
      })
      
      it('should reject names that are too short', () => {
        const result = profileSchema.safeParse({
          firstName: 'A',
          age: 25,
          rating: 7.5
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('at least 2 characters')
        }
      })
      
      it('should reject names that are too long', () => {
        const longName = 'A'.repeat(51)
        const result = profileSchema.safeParse({
          firstName: longName,
          age: 25,
          rating: 7.5
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('less than 50 characters')
        }
      })
      
      it('should reject names with invalid characters', () => {
        const invalidNames = ['John123', 'Mary@', 'Test#Name', 'João', '张伟']
        
        invalidNames.forEach(name => {
          const result = profileSchema.safeParse({
            firstName: name,
            age: 25,
            rating: 7.5
          })
          expect(result.success).toBe(false)
        })
      })
      
      it('should format names to title case', () => {
        const testCases = [
          { input: 'john', expected: 'John' },
          { input: 'MARY', expected: 'Mary' },
          { input: 'jean marie', expected: 'Jean Marie' },
          { input: "o'connor", expected: "O'Connor" },
          { input: 'mary-jane', expected: 'Mary-Jane' }
        ]
        
        testCases.forEach(({ input, expected }) => {
          const result = profileSchema.safeParse({
            firstName: input,
            age: 25,
            rating: 7.5
          })
          expect(result.success).toBe(true)
          if (result.success) {
            expect(result.data.firstName).toBe(expected)
          }
        })
      })
      
      it('should trim whitespace', () => {
        const result = profileSchema.safeParse({
          firstName: '  John  ',
          age: 25,
          rating: 7.5
        })
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.firstName).toBe('John')
        }
      })
    })
    
    describe('age validation', () => {
      it('should accept valid ages', () => {
        const validAges = [18, 21, 35, 50, 65, 99]
        
        validAges.forEach(age => {
          const result = profileSchema.safeParse({
            firstName: 'John',
            age,
            rating: 7.5
          })
          expect(result.success).toBe(true)
        })
      })
      
      it('should reject ages below 18', () => {
        const result = profileSchema.safeParse({
          firstName: 'John',
          age: 17,
          rating: 7.5
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('at least 18')
        }
      })
      
      it('should reject ages above 99', () => {
        const result = profileSchema.safeParse({
          firstName: 'John',
          age: 100,
          rating: 7.5
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('less than 100')
        }
      })
      
      it('should reject non-integer ages', () => {
        const result = profileSchema.safeParse({
          firstName: 'John',
          age: 25.5,
          rating: 7.5
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('whole number')
        }
      })
    })
    
    describe('ethnicity validation', () => {
      it('should accept all valid ethnicity options', () => {
        ETHNICITY_OPTIONS.forEach(option => {
          const result = profileSchema.safeParse({
            firstName: 'John',
            age: 25,
            ethnicity: option.value,
            rating: 7.5
          })
          expect(result.success).toBe(true)
        })
      })
      
      it('should default to empty string when not provided', () => {
        const result = profileSchema.safeParse({
          firstName: 'John',
          age: 25,
          rating: 7.5
        })
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.ethnicity).toBe('')
        }
      })
      
      it('should reject invalid ethnicity values', () => {
        const result = profileSchema.safeParse({
          firstName: 'John',
          age: 25,
          ethnicity: 'invalid-option',
          rating: 7.5
        })
        expect(result.success).toBe(false)
      })
    })
    
    describe('rating validation', () => {
      it('should accept all valid rating options', () => {
        RATING_OPTIONS.forEach(rating => {
          const result = profileSchema.safeParse({
            firstName: 'John',
            age: 25,
            rating
          })
          expect(result.success).toBe(true)
        })
      })
      
      it('should reject ratings below 5.0', () => {
        const result = profileSchema.safeParse({
          firstName: 'John',
          age: 25,
          rating: 4.5
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('at least 5.0')
        }
      })
      
      it('should reject ratings above 10.0', () => {
        const result = profileSchema.safeParse({
          firstName: 'John',
          age: 25,
          rating: 10.5
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('no more than 10.0')
        }
      })
      
      it('should reject ratings not in 0.5 increments', () => {
        const invalidRatings = [5.1, 5.3, 6.7, 8.2, 9.9]
        
        invalidRatings.forEach(rating => {
          const result = profileSchema.safeParse({
            firstName: 'John',
            age: 25,
            rating
          })
          expect(result.success).toBe(false)
          if (!result.success) {
            expect(result.error.issues[0].message).toContain('0.5 increments')
          }
        })
      })
    })
    
    describe('complete form validation', () => {
      it('should validate a complete, valid form', () => {
        const validForm = {
          firstName: 'John',
          age: 25,
          ethnicity: 'european',
          rating: 8.5
        }
        
        const result = profileSchema.safeParse(validForm)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.firstName).toBe('John')
          expect(result.data.age).toBe(25)
          expect(result.data.ethnicity).toBe('european')
          expect(result.data.rating).toBe(8.5)
        }
      })
      
      it('should handle multiple validation errors', () => {
        const invalidForm = {
          firstName: 'A', // too short
          age: 17, // too young
          ethnicity: 'invalid', // invalid option
          rating: 4.0 // too low
        }
        
        const result = profileSchema.safeParse(invalidForm)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues).toHaveLength(4)
        }
      })
    })
  })
  
  describe('profileSessionSchema', () => {
    it('should validate session data without transformations', () => {
      const sessionData = {
        firstName: 'john doe', // not transformed
        age: 25,
        ethnicity: 'european',
        rating: 8.5
      }
      
      const result = profileSessionSchema.safeParse(sessionData)
      expect(result.success).toBe(true)
      if (result.success) {
        // Should not transform case in session schema
        expect(result.data.firstName).toBe('john doe')
      }
    })
    
    it('should handle missing ethnicity with default', () => {
      const sessionData = {
        firstName: 'John',
        age: 25,
        rating: 8.5
      }
      
      const result = profileSessionSchema.safeParse(sessionData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.ethnicity).toBe('')
      }
    })
  })
  
  describe('edge cases and security', () => {
    it('should handle extremely long input gracefully', () => {
      const veryLongName = 'A'.repeat(10000)
      const result = profileSchema.safeParse({
        firstName: veryLongName,
        age: 25,
        rating: 7.5
      })
      expect(result.success).toBe(false)
    })
    
    it('should handle special characters safely', () => {
      const specialChars = ['<script>', '${code}', '../../etc/passwd', '\x00null']
      
      specialChars.forEach(input => {
        const result = profileSchema.safeParse({
          firstName: input,
          age: 25,
          rating: 7.5
        })
        expect(result.success).toBe(false)
      })
    })
    
    it('should handle numeric edge cases', () => {
      const edgeCases = [
        { age: -1, rating: 7.5 },
        { age: 25, rating: -5 },
        { age: Infinity, rating: 7.5 },
        { age: 25, rating: NaN },
        { age: 25, rating: Infinity }
      ]
      
      edgeCases.forEach(data => {
        const result = profileSchema.safeParse({
          firstName: 'John',
          ...data
        })
        expect(result.success).toBe(false)
      })
    })
  })
})