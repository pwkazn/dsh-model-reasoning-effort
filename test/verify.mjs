/**
 * Pure-logic tests for the browser bundle. The bundle registers a factory on
 * the page's module queue, so the harness stubs that queue and React, then
 * exercises the exported `__test` helpers the same way the UI does.
 */
import assert from 'node:assert/strict'

let captured
globalThis.window = {
	__ModuleLoader__: {
		load(options) {
			captured = options
		},
	},
}

await import('../client.js')

assert.ok(captured, 'the bundle registered a module-loader factory')
assert.equal(captured.id, 'dsh-model-reasoning-effort')

const ReactStub = {
	createElement: () => null,
	useState: value => [value, () => {}],
	useCallback: fn => fn,
	useEffect: () => {},
	useMemo: fn => fn(),
	useRef: value => ({ current: value }),
}
const requireStub = name => {
	if (name === 'react') return ReactStub
	throw new Error(`unexpected module request: ${name}`)
}

const client = captured.factory(requireStub)
assert.equal(typeof client.apply, 'function')
assert.deepEqual(client.inject, ['slots', 'remote', 'remote.settings', 'locale'])

const {
	LEVELS,
	PRESET_LEVELS,
	toDraft,
	fromDraft,
	draftProblem,
	applyEfforts,
	applyEffortsToAll,
	summaryText,
	project,
	presetDraft,
} = client.__test

const t = key => {
	const copy = {
		needLevel: 'need-level',
		needThinkingLevel: 'need-thinking-level',
		needWire: level => `need-wire:${level}`,
		stateInherit: 'inherited',
		stateNone: 'none',
		stateCustom: 'declared',
	}
	return copy[key]
}

assert.deepEqual(LEVELS, ['off', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max'])

// Three-state projection.
assert.equal(toDraft(undefined).mode, 'inherit')
assert.equal(toDraft(false).mode, 'none')
const dictDraft = toDraft({ off: null, high: 'ultra', low: 'low' })
assert.equal(dictDraft.mode, 'custom')
assert.deepEqual(dictDraft.levels.off, { on: true, wire: '' })
assert.deepEqual(dictDraft.levels.high, { on: true, wire: 'ultra' })
assert.equal(dictDraft.levels.medium.on, false)

// Round trips preserve the stored shape, including a valueless off.
assert.deepEqual(fromDraft(toDraft({ off: null, high: 'ultra' })), { off: null, high: 'ultra' })
assert.equal(fromDraft(toDraft(false)), false)
assert.equal(fromDraft(toDraft(undefined)), undefined)

// Validation mirrors the adapter: a declaration needs a level beyond off and
// every such level needs a non-empty wire value.
assert.equal(draftProblem(toDraft(undefined), t), undefined)
assert.equal(draftProblem({ mode: 'custom', levels: toDraft({}).levels }, t), 'need-level')
assert.equal(draftProblem(toDraft({ off: null }), t), 'need-thinking-level')
assert.equal(draftProblem(toDraft({ off: null, high: '' }), t), 'need-wire:high')
assert.equal(draftProblem(toDraft({ off: null, high: 'high' }), t), undefined)
assert.equal(draftProblem(toDraft({ off: '', high: 'high' }), t), undefined)

// One-model edits keep sibling fields and delete on inherit.
const models = [
	{ id: 'a', name: 'A', contextWindow: 1000, input: ['text'] },
	{ id: 'b', name: 'B' },
]
const edited = applyEfforts(models, 0, { off: null, high: 'ultra' })
assert.deepEqual(edited[0], {
	id: 'a',
	name: 'A',
	contextWindow: 1000,
	input: ['text'],
	reasoningEfforts: { off: null, high: 'ultra' },
})
assert.equal(edited[1], models[1])
assert.deepEqual(applyEfforts(edited, 0, undefined)[0], models[0])
assert.equal(applyEfforts(edited, 1, false)[1].reasoningEfforts, false)

// Batch edits touch every model without mutating the input.
const batch = applyEffortsToAll(models, { off: null, high: 'high' })
assert.equal(batch.length, 2)
assert.equal(batch[0].contextWindow, 1000)
assert.deepEqual(batch[1].reasoningEfforts, { off: null, high: 'high' })
assert.equal(models[0].reasoningEfforts, undefined)

// Summaries name the declaration in one line.
assert.equal(summaryText(undefined, t), 'inherited')
assert.equal(summaryText(false, t), 'none')
assert.equal(summaryText({ off: null, high: 'ultra', low: 'low' }, t), 'off · low · high→ultra')

// Projection separates editable catalogs from catalog-only routes.
const view = {
	revision: 7,
	value: {
		providers: {
			gateway: {
				displayName: 'Gateway',
				models: [{ id: 'm1' }, { id: 'm2', name: 'M2' }],
			},
			installed: {},
			named: { models: [] },
		},
	},
}
const projected = project(view)
assert.deepEqual(projected.editable.map(entry => entry.route), ['gateway', 'named'])
assert.equal(projected.editable[0].displayName, 'Gateway')
assert.equal(projected.editable[1].displayName, 'named')
assert.deepEqual(projected.skipped.map(entry => entry.route), ['installed'])
assert.deepEqual(project({ value: {} }), { editable: [], skipped: [] })

// Authored layers win over the schema-resolved value, so a first save cannot
// bake materialized defaults (`input: []`, empty compat) into the profile.
const layered = {
	value: { providers: { gateway: { models: [{ id: 'm1', input: [], compat: {} }] } } },
	base: { providers: { gateway: { models: [{ id: 'm1' }] } } },
	user: { providers: { gateway: { models: [{ id: 'm1', reasoningEfforts: { off: null } }] } } },
}
assert.deepEqual(project(layered).editable[0].models, [{ id: 'm1', reasoningEfforts: { off: null } }])
assert.deepEqual(project({ ...layered, user: {} }).editable[0].models, [{ id: 'm1' }])
assert.deepEqual(project({ value: layered.value }).editable[0].models, [{ id: 'm1', input: [], compat: {} }])

// The preset is a valid custom declaration.
const preset = presetDraft()
assert.equal(preset.mode, 'custom')
assert.deepEqual(PRESET_LEVELS.filter(level => preset.levels[level].on), PRESET_LEVELS)
assert.equal(preset.levels.off.wire, '')
assert.equal(preset.levels.high.wire, 'high')

console.log('dsh-model-reasoning-effort: all checks passed')
