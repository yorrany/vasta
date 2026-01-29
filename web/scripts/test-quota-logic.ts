
import { enforcePlanQuotas } from '../lib/billing-logic'

// Mock Plans
jest.mock('../lib/plans', () => ({
    getPlanByCode: (code: string) => {
        if (code === 'start') return { offer_limit: 3, code: 'start' }
        if (code === 'pro') return { offer_limit: 10, code: 'pro' }
        if (code === 'business') return { offer_limit: null, code: 'business' }
        return undefined
    }
}))

// Mock Supabase Client
const mockSupabase = {
    from: jest.fn(),
}

async function runTest() {
    console.log('Running Quota Logic Verification...')

    // Setup Mock Data
    const userId = 'user_123'
    const products = [
        { id: 'p1', title: 'P1', created_at: '2023-01-01', status: 'active' }, // Oldest
        { id: 'p2', title: 'P2', created_at: '2023-01-02', status: 'active' },
        { id: 'p3', title: 'P3', created_at: '2023-01-03', status: 'active' },
        { id: 'p4', title: 'P4', created_at: '2023-01-04', status: 'active' },
        { id: 'p5', title: 'P5', created_at: '2023-01-05', status: 'active' }  // Newest
    ]
    // Total 5 products. Plan 'start' limit is 3. Excess is 2.
    // Should remove P5 and P4 (Newest first).

    // Mock implementations
    const selectQueryMock = jest.fn()
    const eqQueryMock = jest.fn()
    const orderQueryMock = jest.fn()
    const limitQueryMock = jest.fn()
    const updateQueryMock = jest.fn()
    const inQueryMock = jest.fn()

    mockSupabase.from.mockReturnValue({
        select: selectQueryMock,
        update: updateQueryMock
    })

    // 1. Mock Count
    // chain: from('products').select('*', {count, head}).eq().eq()
    selectQueryMock.mockReturnValue({
        eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ count: 5, error: null })
        })
    })

    // 2. Mock Fetch Excess
    // chain: from('products').select().eq().eq().order().limit()
    // Note: select matches both calls, need to handle distinct returns based on args?
    // Or just mock the chain sequence.

    // Simplify: Use a stronger mock
    const activeProducts = [...products]

    const mockChain = {
        select: jest.fn((fields, options) => {
            if (options?.count) {
                return { eq: () => ({ eq: () => Promise.resolve({ count: 5, error: null }) }) }
            }
            return {
                eq: () => ({
                    eq: () => ({
                        order: () => ({
                            limit: (n: number) => {
                                // Return top N sorted by DESC created_at
                                const sorted = [...activeProducts].sort((a, b) => b.created_at.localeCompare(a.created_at))
                                return Promise.resolve({ data: sorted.slice(0, n), error: null })
                            }
                        })
                    })
                })
            }
        }),
        update: jest.fn(() => ({
            in: (col: string, ids: string[]) => {
                console.log('Archiving IDs:', ids)
                return Promise.resolve({ error: null })
            }
        }))
    }

    mockSupabase.from.mockReturnValue(mockChain)

    // EXECUTE
    await enforcePlanQuotas(userId, 'start', mockSupabase)

    console.log('Test completed.')
}

// Since we are running with tsx and NOT jest, we need a minimal jest-like mock
const jest = {
    fn: (impl?: any) => {
        const mock: any = impl ? (...args: any[]) => impl(...args) : () => { }
        mock.mockReturnValue = (val: any) => {
            mock.impl = () => val
            return mock
        }
        mock.mockResolvedValue = (val: any) => {
            mock.impl = () => Promise.resolve(val)
            return mock
        }
        return mock
    },
    mock: (path: string, factory: any) => {
        console.log(`Mocking module ${path}`)
        // This doesn't work in runtime without a loader. 
        // We have to mock by passing deps or manual mocking.
        // We already inject 'client'. But 'getPlanByCode' is imported directly.
        // We can't easily mock 'getPlanByCode' without a true test runner.
        // BUT, 'getPlanByCode' is a pure function reading from a constant array.
        // If we rely on the REAL 'plans.ts', it should work if we use real plan codes.
    }
}

// Re-write without jest mocks for imports, just use real code + mocked client
// We will use the REAL getPlanByCode.
// We only need to mock the Supabase client passed as argument.

async function runRealTest() {
    // We need to import the real function.
    // const { enforcePlanQuotas } = require('../lib/billing-logic') // Require might fail in ESM

    // We are inside the file content to be written. Use imports.

    console.log('Running Quota Logic Verification (Real Plans, Mock DB)...')

    const client = {
        from: (table: string) => {
            return {
                select: (fields: string, options: any) => {
                    // Mock COUNT
                    if (options?.count === 'exact') {
                        return {
                            eq: (col: string, val: any) => ({
                                eq: (col2: string, val2: any) => {
                                    return Promise.resolve({ count: 5, error: null }) // Simulate 5 products
                                }
                            })
                        }
                    }

                    // Mock FETCH EXCESS
                    return {
                        eq: (col: string, val: any) => ({
                            eq: (col2: string, val2: any) => ({
                                order: (col3: string, opts: any) => ({
                                    limit: (n: number) => {
                                        // Return N dummy items
                                        console.log(`Fetching ${n} items to archive...`)
                                        const dummyItems = [
                                            { id: 'p5_newest', created_at: '2023-05' },
                                            { id: 'p4_newer', created_at: '2023-04' }
                                        ]
                                        return Promise.resolve({ data: dummyItems.slice(0, n), error: null })
                                    }
                                })
                            })
                        })
                    }
                },
                update: (updates: any) => {
                    return {
                        in: (col: string, ids: string[]) => {
                            console.log('Archived IDs:', ids)
                            if (ids.includes('p5_newest') && ids.includes('p4_newer') && ids.length === 2) {
                                console.log('✅ SUCCESS: Correct items identified for archiving.')
                            } else {
                                console.error('❌ FAILURE: Incorrect items identified.')
                            }
                            return Promise.resolve({ error: null })
                        }
                    }
                }
            }
        }
    }

    await enforcePlanQuotas('user_123', 'start', client)
}

runRealTest().catch(console.error)
