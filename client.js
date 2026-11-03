/**
 * `dsh-model-reasoning-effort` browser half.
 *
 * The official Models page deliberately leaves reasoning effort out of its
 * provider editor: effort is a per-model capability, so a provider-scoped
 * control could only be set to a value some models reject. The pi-ai adapter
 * still accepts `reasoningEfforts` on every `models[]` entry — this plugin
 * gives that field an editor.
 *
 * It contributes a section to the Models page's `settings.models.footer`
 * list seat. That seat is deliberately chosen over the keyed provider-card
 * seat: the card seat admits one entry per settings namespace, and another
 * installed plugin may already own `llm-pi-ai` there. The footer admits one
 * entry per plugin id, so this panel composes instead of competing.
 *
 * Every save is one ordinary `settings.mutate` write that replaces the
 * provider's complete `models` array in the user layer, preserving every
 * field this panel does not edit. That is the same shape the official model
 * editor writes when it first materializes an inherited catalog.
 *
 * This file is the loader's closure-factory artifact by hand, so the package
 * needs no build step: it registers a factory on the page's module queue and
 * resolves React through the module table the shell seeds.
 */
window.__ModuleLoader__.load({
	id: 'dsh-model-reasoning-effort',
	factory: (require) => {
		var module = { exports: {} }
		var exports = module.exports

		const React = require('react')
		const h = React.createElement

		/** Settings namespace owning pi-ai provider profiles. */
		const NS = 'llm-pi-ai'
		/** Locale namespace owning this package's copy. */
		const COPY_NS = 'dsh.modelReasoning'
		/** Every pi-ai thinking level, in escalation order. */
		const LEVELS = ['off', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max']
		/** Levels a one-click preset starts with: the common gateway ladder. */
		const PRESET_LEVELS = ['off', 'low', 'medium', 'high']

		const en = {
			title: 'Reasoning effort (custom models)',
			hint: 'Declare the thinking levels each custom pi-ai model offers, and the value sent on the wire for each. A declaration is an assertion, not a probe: a gateway that rejects a level fails the request, so declare only what the endpoint supports.',
			refresh: 'Refresh',
			loading: 'Reading the settings document…',
			unavailable: 'Reasoning effort is unavailable: the settings document is read-only or carries no llm-pi-ai section.',
			readOnly: 'The settings document is read-only, so declarations cannot be saved.',
			empty: 'No custom provider declares a model catalog yet.',
			emptyHint: 'Add a custom model provider on this page first; its models then appear here.',
			skippedTitle: 'Providers without a model catalog',
			skippedHint: 'These routes serve the installed pi-ai catalog directly, which the browser cannot enumerate. Add the models to the official model list first if they need effort declarations.',
			modelCount: n => (n === 1 ? '1 model' : `${n} models`),
			declaredCount: (declared, total) => `${declared}/${total} declared`,
			collapse: 'Collapse',
			expand: 'Expand',
			edit: 'Edit',
			close: 'Close',
			stateInherit: 'Inherited (not declared)',
			stateNone: 'No reasoning',
			stateCustom: 'Declared',
			inherit: 'Inherit',
			none: 'No reasoning',
			custom: 'Declare levels',
			inheritHint: 'Remove this model’s reasoningEfforts and keep whatever the installed catalog or provider supplies.',
			noneHint: 'Write reasoningEfforts: false so selectors show no thinking levels for this model.',
			customHint: 'Checked levels become the selector vocabulary; the wire value is what dispatch sends for that level.',
			level: 'Level',
			wire: 'Wire value',
			wirePlaceholder: 'e.g. low',
			wireOffPlaceholder: 'empty = send nothing',
			fillSame: 'Fill same-as-level',
			apply: 'Save declaration',
			applying: 'Saving…',
			applied: 'Saved.',
			reset: 'Reset',
			conflict: 'The settings document changed elsewhere; the panel reloaded. Try again.',
			needLevel: 'Check at least one level, or choose Inherit / No reasoning.',
			needThinkingLevel: 'A declaration must offer at least one level besides off.',
			needWire: level => `“${level}” needs a wire value.`,
			batchTitle: 'Declare the same levels for every model',
			batchHint: 'One write applies this declaration to all models on the provider. Use it for a homogeneous gateway, then fine-tune individual models below.',
			applyAll: n => (n === 1 ? 'Apply to 1 model' : `Apply to ${n} models`),
			appliedAll: n => (n === 1 ? 'Declaration applied to 1 model.' : `Declaration applied to ${n} models.`),
			saveHint: 'Saving copies this provider’s complete model list into the user settings layer, exactly as the official model editor does; fields edited elsewhere are preserved.',
			modelList: 'Models',
			noModels: 'This provider declares an empty model list.',
			providerNote: 'Wire values are sent verbatim; “off” with an empty value sends no reasoning parameter at all.',
		}

		const zh = {
			title: '推理强度（自定义模型）',
			hint: '为每个自定义 pi-ai 模型声明它支持的思考档位，以及每档实际发送的取值。声明是断言而不是探测：网关拒绝某个档位时请求会失败，因此只声明端点确实支持的档位。',
			refresh: '刷新',
			loading: '正在读取设置文档…',
			unavailable: '推理强度不可用：设置文档为只读，或没有 llm-pi-ai 段。',
			readOnly: '设置文档为只读，无法保存声明。',
			empty: '还没有自定义提供方声明模型目录。',
			emptyHint: '请先在本页添加自定义模型提供方，它的模型随后会出现在这里。',
			skippedTitle: '未声明模型目录的提供方',
			skippedHint: '这些路线直接服务内置 pi-ai 目录，浏览器无法枚举其中的模型。如需声明档位，请先把模型加入官方模型列表。',
			modelCount: n => `${n} 个模型`,
			declaredCount: (declared, total) => `已声明 ${declared}/${total}`,
			collapse: '收起',
			expand: '展开',
			edit: '编辑',
			close: '收起',
			stateInherit: '继承（未声明）',
			stateNone: '无推理',
			stateCustom: '已声明',
			inherit: '继承',
			none: '无推理',
			custom: '声明档位',
			inheritHint: '删除该模型的 reasoningEfforts，继续使用内置目录或提供方给出的能力。',
			noneHint: '写入 reasoningEfforts: false，模型选择器不再为该模型提供思考档位。',
			customHint: '勾选的档位即选择器里的选项；发送值是该档位在请求中实际携带的内容。',
			level: '档位',
			wire: '发送值',
			wirePlaceholder: '例如 low',
			wireOffPlaceholder: '留空 = 不发送参数',
			fillSame: '填入同名值',
			apply: '保存声明',
			applying: '保存中…',
			applied: '已保存。',
			reset: '重置',
			conflict: '设置文档已在别处改动，面板已重新读取，请重试。',
			needLevel: '至少勾选一个档位，或改为「继承」/「无推理」。',
			needThinkingLevel: '声明必须包含 off 以外至少一个档位。',
			needWire: level => `「${level}」需要一个发送值。`,
			batchTitle: '为该提供方的全部模型声明同一组档位',
			batchHint: '一次写入应用到该提供方的所有模型。适合档位一致的网关，之后可在下方逐模型微调。',
			applyAll: n => `应用到全部 ${n} 个模型`,
			appliedAll: n => `已为 ${n} 个模型写入声明。`,
			saveHint: '保存会将该提供方的完整模型列表复制到用户设置层，与官方模型编辑器一致；其他界面编辑的字段会原样保留。',
			modelList: '模型',
			noModels: '该提供方声明了空模型列表。',
			providerNote: '发送值原样发出；「off」留空表示完全不发送推理参数。',
		}

		/**
		 * Read one path out of a settings subtree.
		 * @param value - the subtree root.
		 * @param path - segment names.
		 * @returns the value at the path, or undefined.
		 */
		function getPath(value, path) {
			let current = value
			for (const segment of path) {
				if (current === null || typeof current !== 'object') return undefined
				current = current[segment]
			}
			return current
		}

		/**
		 * Whether a stored value is a plain level dictionary.
		 * @param value - a model's reasoningEfforts value.
		 * @returns true for an object declaration.
		 */
		function isEffortDict(value) {
			return value !== null && typeof value === 'object' && !Array.isArray(value)
		}

		/**
		 * Project one model's stored declaration into an editor draft.
		 * @param efforts - stored reasoningEfforts (false, a dict, or undefined).
		 * @returns a draft with one row per known level.
		 */
		function toDraft(efforts) {
			const levels = {}
			for (const level of LEVELS) levels[level] = { on: false, wire: '' }
			if (isEffortDict(efforts)) {
				for (const level of LEVELS) {
					if (!Object.hasOwn(efforts, level)) continue
					const wire = efforts[level]
					levels[level] = {
						on: true,
						wire: wire === null || wire === undefined ? '' : String(wire),
					}
				}
				return { mode: 'custom', levels }
			}
			return { mode: efforts === false ? 'none' : 'inherit', levels }
		}

		/**
		 * Project an editor draft back into the stored declaration shape.
		 * @param draft - the editor draft.
		 * @returns undefined for inherit, false for no reasoning, or a level dict.
		 */
		function fromDraft(draft) {
			if (draft.mode === 'inherit') return undefined
			if (draft.mode === 'none') return false
			const declared = {}
			for (const level of LEVELS) {
				const row = draft.levels[level]
				if (row === undefined || !row.on) continue
				const wire = row.wire.trim()
				// An empty `off` means “supported, send nothing”; every other
				// level is rejected by validation before this point.
				declared[level] = wire === '' ? null : wire
			}
			return declared
		}

		/**
		 * The first problem that makes a draft unsendable.
		 * @param draft - the editor draft.
		 * @param t - copy lookup.
		 * @returns the message, or undefined when the draft is valid.
		 */
		function draftProblem(draft, t) {
			if (draft.mode !== 'custom') return undefined
			const on = LEVELS.filter(level => draft.levels[level]?.on)
			if (on.length === 0) return t('needLevel')
			if (!on.some(level => level !== 'off')) return t('needThinkingLevel')
			for (const level of on) {
				if (level !== 'off' && draft.levels[level].wire.trim() === '') return t('needWire')(level)
			}
			return undefined
		}

		/**
		 * Replace one model's declaration, preserving every other field.
		 * @param models - the provider's model list.
		 * @param index - the model to change.
		 * @param efforts - the new reasoningEfforts value.
		 * @returns a new model list.
		 */
		function applyEfforts(models, index, efforts) {
			return models.map((model, at) => {
				if (at !== index) return model
				const next = { ...model }
				if (efforts === undefined) delete next.reasoningEfforts
				else next.reasoningEfforts = efforts
				return next
			})
		}

		/**
		 * Replace every model's declaration, preserving every other field.
		 * @param models - the provider's model list.
		 * @param efforts - the new reasoningEfforts value for all models.
		 * @returns a new model list.
		 */
		function applyEffortsToAll(models, efforts) {
			return models.map(model => {
				const next = { ...model }
				if (efforts === undefined) delete next.reasoningEfforts
				else next.reasoningEfforts = efforts
				return next
			})
		}

		/**
		 * One-line description of a stored declaration.
		 * @param efforts - stored reasoningEfforts.
		 * @param t - copy lookup.
		 * @returns the description.
		 */
		function summaryText(efforts, t) {
			if (efforts === false) return t('stateNone')
			if (!isEffortDict(efforts)) return t('stateInherit')
			const parts = []
			for (const level of LEVELS) {
				if (!Object.hasOwn(efforts, level)) continue
				const wire = efforts[level]
				if (level === 'off' && (wire === null || wire === undefined || wire === '')) parts.push('off')
				else if (wire === level) parts.push(level)
				else parts.push(`${level}→${wire === null || wire === undefined ? '∅' : String(wire)}`)
			}
			return parts.length === 0 ? t('stateCustom') : parts.join(' · ')
		}

		/**
		 * The model list a provider currently serves, preferring an authored
		 * layer over the schema-resolved value. The resolved value materializes
		 * every optional field (`input: []`, an empty `compat` object, …), so
		 * writing it back would bake schema defaults into the profile on the
		 * first edit. The user layer wins because a `models` array replaces the
		 * one below it; the composition base is the next authored answer.
		 * @param view - the llm-pi-ai namespace view.
		 * @param route - the provider route key.
		 * @returns the model list, or undefined when no layer declares one.
		 */
		function modelsFor(view, route) {
			const userModels = getPath(view, ['user', 'providers', route, 'models'])
			if (Array.isArray(userModels)) return userModels
			const baseModels = getPath(view, ['base', 'providers', route, 'models'])
			if (Array.isArray(baseModels)) return baseModels
			const resolved = getPath(view, ['value', 'providers', route, 'models'])
			return Array.isArray(resolved) ? resolved : undefined
		}

		/**
		 * Project the pi-ai section into editable providers and skipped routes.
		 * @param view - the llm-pi-ai namespace view.
		 * @returns editable providers (those declaring models) and skipped routes.
		 */
		function project(view) {
			const providers = getPath(view, ['value', 'providers'])
			const editable = []
			const skipped = []
			if (providers === null || typeof providers !== 'object' || Array.isArray(providers)) {
				return { editable, skipped }
			}
			for (const [route, profile] of Object.entries(providers)) {
				if (profile === null || typeof profile !== 'object' || Array.isArray(profile)) continue
				const displayName = typeof profile.displayName === 'string' && profile.displayName.trim() !== ''
					? profile.displayName
					: route
				const models = modelsFor(view, route)
				if (models !== undefined) editable.push({ route, displayName, models })
				else skipped.push({ route, displayName })
			}
			return { editable, skipped }
		}

		/** A draft with the common gateway ladder already selected. */
		function presetDraft() {
			const levels = {}
			for (const level of LEVELS) levels[level] = { on: false, wire: '' }
			for (const level of PRESET_LEVELS) {
				levels[level] = { on: true, wire: level === 'off' ? '' : level }
			}
			return { mode: 'custom', levels }
		}

		const styles = {
			block: {
				margin: '14px 0 0',
				padding: '14px 16px',
				border: '1px solid var(--dsw-alias-border-l2)',
				borderRadius: '12px',
				background: 'var(--dsw-alias-bg-layer-1)',
				color: 'var(--dsw-alias-label-primary)',
				fontSize: '13px',
			},
			header: {
				display: 'flex',
				alignItems: 'center',
				gap: '10px',
				flexWrap: 'wrap',
			},
			title: { margin: 0, fontSize: '14px', fontWeight: 600, flex: 1 },
			hint: {
				margin: '8px 0 0',
				color: 'var(--dsw-alias-label-tertiary)',
				lineHeight: 1.55,
			},
			provider: {
				margin: '10px 0 0',
				border: '1px solid var(--dsw-alias-border-l2)',
				borderRadius: '10px',
				padding: '10px 12px',
			},
			providerButton: {
				display: 'flex',
				alignItems: 'center',
				gap: '8px',
				width: '100%',
				padding: 0,
				border: 'none',
				background: 'transparent',
				color: 'inherit',
				cursor: 'pointer',
				font: 'inherit',
				textAlign: 'left',
			},
			chevron: { color: 'var(--dsw-alias-label-tertiary)', fontSize: '11px' },
			providerName: { fontWeight: 600 },
			route: {
				fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
				fontSize: '12px',
				color: 'var(--dsw-alias-label-tertiary)',
			},
			count: { marginLeft: 'auto', color: 'var(--dsw-alias-label-tertiary)', fontSize: '12px' },
			modelRow: {
				display: 'flex',
				flexWrap: 'wrap',
				gap: '10px',
				alignItems: 'flex-start',
				padding: '10px 0',
				borderTop: '1px solid var(--dsw-alias-border-l2)',
			},
			modelMain: { flex: 1, minWidth: 0 },
			modelName: { fontWeight: 500, overflowWrap: 'anywhere' },
			modelId: {
				marginTop: '2px',
				fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
				fontSize: '11.5px',
				color: 'var(--dsw-alias-label-tertiary)',
				overflowWrap: 'anywhere',
			},
			summary: {
				marginTop: '3px',
				fontSize: '12px',
				color: 'var(--dsw-alias-label-secondary)',
				overflowWrap: 'anywhere',
			},
			editor: {
				margin: '0 0 4px',
				padding: '10px 12px',
				border: '1px solid var(--dsw-alias-border-l2)',
				borderRadius: '8px',
				background: 'var(--dsw-alias-bg-layer-2)',
			},
			modes: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
			modeButton: {
				padding: '5px 10px',
				border: '1px solid var(--dsw-alias-border-l2)',
				borderRadius: '999px',
				background: 'transparent',
				color: 'var(--dsw-alias-label-secondary)',
				cursor: 'pointer',
				font: 'inherit',
			},
			modeButtonActive: {
				borderColor: 'var(--dsw-alias-button-primary-fill)',
				background: 'var(--dsw-alias-button-primary-fill)',
				color: 'var(--dsw-alias-label-primary-foreground)',
			},
			levelGrid: {
				display: 'grid',
				gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
				gap: '8px',
				marginTop: '10px',
			},
			levelCard: {
				display: 'flex',
				flexDirection: 'column',
				gap: '5px',
				padding: '7px 8px',
				border: '1px solid var(--dsw-alias-border-l1, var(--dsw-alias-border-l2))',
				borderRadius: '8px',
			},
			levelLabel: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px' },
			input: {
				width: '100%',
				boxSizing: 'border-box',
				padding: '5px 7px',
				border: '1px solid var(--dsw-alias-border-l2)',
				borderRadius: '6px',
				background: 'transparent',
				color: 'inherit',
				font: 'inherit',
				fontSize: '12.5px',
			},
			actions: {
				display: 'flex',
				gap: '8px',
				alignItems: 'center',
				flexWrap: 'wrap',
				marginTop: '10px',
			},
			status: { flex: 1, color: 'var(--dsw-alias-label-tertiary)', fontSize: '12.5px', minWidth: '120px' },
			error: { flex: 1, color: 'var(--dsw-alias-state-error-primary)', fontSize: '12.5px', minWidth: '120px' },
			primary: {
				padding: '5px 12px',
				border: 'none',
				borderRadius: '6px',
				background: 'var(--dsw-alias-button-primary-fill)',
				color: 'var(--dsw-alias-label-primary-foreground)',
				cursor: 'pointer',
				font: 'inherit',
			},
			secondary: {
				padding: '5px 11px',
				border: '1px solid var(--dsw-alias-border-l2)',
				borderRadius: '6px',
				background: 'transparent',
				color: 'var(--dsw-alias-label-secondary)',
				cursor: 'pointer',
				font: 'inherit',
			},
			small: {
				padding: '4px 9px',
				fontSize: '12.5px',
			},
			batch: {
				marginTop: '10px',
				padding: '10px 12px',
				border: '1px dashed var(--dsw-alias-border-l3)',
				borderRadius: '8px',
			},
			note: {
				margin: '8px 0 0',
				fontSize: '12px',
				color: 'var(--dsw-alias-label-tertiary)',
				lineHeight: 1.5,
			},
		}

		/**
		 * The level editor shared by one model row and the provider preset.
		 * @param props - t, initial draft, submit label, disabled flag, onApply.
		 * @returns the editor element.
		 */
		function EffortDraftEditor(props) {
			const t = props.t
			const [draft, setDraft] = React.useState(props.initial)
			const [problem, setProblem] = React.useState(undefined)

			const setMode = mode => {
				setDraft(current => ({ ...current, mode }))
				setProblem(undefined)
			}
			const toggle = level => {
				setDraft(current => ({
					...current,
					levels: {
						...current.levels,
						[level]: {
							on: !current.levels[level].on,
							wire: current.levels[level].wire,
						},
					},
				}))
				setProblem(undefined)
			}
			const setWire = (level, wire) => {
				setDraft(current => ({
					...current,
					levels: { ...current.levels, [level]: { on: current.levels[level].on, wire } },
				}))
				setProblem(undefined)
			}
			const fillSame = () => {
				setDraft(current => {
					const levels = {}
					for (const level of LEVELS) {
						const row = current.levels[level]
						levels[level] = level === 'off'
							? { on: row.on, wire: row.wire }
							: { on: row.on, wire: row.on ? level : row.wire }
					}
					return { ...current, levels }
				})
			}
			const apply = () => {
				const refused = draftProblem(draft, t)
				if (refused !== undefined) {
					setProblem(refused)
					return
				}
				props.onApply(fromDraft(draft))
			}

			const modeButton = (mode, label, hint) => h('button', {
				key: mode,
				type: 'button',
				style: draft.mode === mode ? { ...styles.modeButton, ...styles.modeButtonActive } : styles.modeButton,
				'aria-pressed': draft.mode === mode,
				title: hint,
				onClick: () => setMode(mode),
			}, label)

			const body = [
				h('div', { key: 'modes', style: styles.modes }, [
					modeButton('inherit', t('inherit'), t('inheritHint')),
					modeButton('none', t('none'), t('noneHint')),
					modeButton('custom', t('custom'), t('customHint')),
				]),
			]
			if (draft.mode === 'custom') {
				body.push(h('p', { key: 'hint', style: styles.hint }, t('customHint')))
				body.push(h('div', { key: 'levels', style: styles.levelGrid }, LEVELS.map(level => {
					const row = draft.levels[level]
					return h('div', { key: level, style: styles.levelCard }, [
						h('label', { key: 'label', style: styles.levelLabel }, [
							h('input', {
								key: 'check',
								type: 'checkbox',
								checked: row.on,
								onChange: () => toggle(level),
							}),
							h('span', { key: 'name' }, level),
						]),
						h('input', {
							key: 'wire',
							style: styles.input,
							value: row.wire,
							disabled: !row.on,
							placeholder: level === 'off' ? t('wireOffPlaceholder') : t('wirePlaceholder'),
							'aria-label': `${level} ${t('wire')}`,
							spellCheck: false,
							onChange: event => setWire(level, event.target.value),
						}),
					])
				})))
				body.push(h('button', {
					key: 'fill',
					type: 'button',
					style: { ...styles.secondary, ...styles.small, marginTop: '8px' },
					onClick: fillSame,
				}, t('fillSame')))
			} else {
				body.push(h('p', { key: 'hint', style: styles.hint }, draft.mode === 'none' ? t('noneHint') : t('inheritHint')))
			}
			body.push(h('div', { key: 'actions', style: styles.actions }, [
				h('span', {
					key: 'status',
					style: problem === undefined ? styles.status : styles.error,
					role: problem === undefined ? undefined : 'alert',
				}, problem ?? ''),
				h('button', {
					key: 'apply',
					type: 'button',
					style: { ...styles.primary, ...styles.small },
					disabled: props.disabled,
					onClick: apply,
				}, props.submitLabel),
			]))

			return h('div', { style: styles.editor }, body)
		}

		/**
		 * One model row with its own expandable editor.
		 * @param props - model, index, t, disabled, save callback.
		 * @returns the row element.
		 */
		function ModelRow(props) {
			const { model, index, t, busy, onSave } = props
			const [open, setOpen] = React.useState(false)
			const name = typeof model.name === 'string' && model.name.trim() !== '' ? model.name : model.id
			const key = String(model.id)
			return h('div', { style: styles.modelRow }, [
				h('div', { key: 'main', style: styles.modelMain }, [
					h('div', { key: 'name', style: styles.modelName }, name),
					name !== model.id ? h('div', { key: 'id', style: styles.modelId }, key) : null,
					h('div', { key: 'summary', style: styles.summary }, summaryText(model.reasoningEfforts, t)),
				]),
				h('button', {
					key: 'edit',
					type: 'button',
					style: { ...styles.secondary, ...styles.small, flex: '0 0 auto' },
					'aria-expanded': open,
					onClick: () => setOpen(current => !current),
				}, open ? t('close') : t('edit')),
				open ? h('div', { key: 'editor', style: { flexBasis: '100%' } },
					h(EffortDraftEditor, {
						t,
						initial: toDraft(model.reasoningEfforts),
						submitLabel: busy ? t('applying') : t('apply'),
						disabled: busy,
						onApply: efforts => onSave(index, efforts),
					})
				) : null,
			])
		}

		/**
		 * One provider's models, preset, and save hint.
		 * @param props - provider entry, t, busy flag, save callbacks.
		 * @returns the provider element.
		 */
		function ProviderSection(props) {
			const { provider, t, busy, open, onToggle, onSave, onSaveAll } = props
			const declared = provider.models.filter(model => model.reasoningEfforts !== undefined).length
			return h('div', { style: styles.provider }, [
				h('button', {
					key: 'head',
					type: 'button',
					style: styles.providerButton,
					'aria-expanded': open,
					onClick: onToggle,
				}, [
					h('span', { key: 'chevron', style: styles.chevron }, open ? '▾' : '▸'),
					h('span', { key: 'name', style: styles.providerName }, provider.displayName),
					h('span', { key: 'route', style: styles.route }, provider.route),
					h('span', { key: 'count', style: styles.count }, `${t('modelCount')(provider.models.length)} · ${t('declaredCount')(declared, provider.models.length)}`),
				]),
				open ? h('div', { key: 'body' }, [
					h('p', { key: 'hint', style: styles.note }, t('providerNote')),
					h('div', { key: 'batch', style: styles.batch }, [
						h('div', { key: 'title', style: { fontWeight: 600 } }, t('batchTitle')),
						h('p', { key: 'hint', style: styles.note }, t('batchHint')),
						h(EffortDraftEditor, {
							key: 'editor',
							t,
							initial: presetDraft(),
							submitLabel: busy ? t('applying') : t('applyAll')(provider.models.length),
							disabled: busy || provider.models.length === 0,
							onApply: efforts => onSaveAll(efforts),
						}),
					]),
					provider.models.length === 0
						? h('p', { key: 'empty', style: styles.hint }, t('noModels'))
						: h('div', { key: 'models' }, [
							h('div', { key: 'title', style: { marginTop: '10px', fontWeight: 600 } }, t('modelList')),
							...provider.models.map((model, index) => h(ModelRow, {
								key: `${provider.route}\u0000${model.id}\u0000${index}`,
								model,
								index,
								t,
								busy,
								onSave,
							})),
						]),
				]) : null,
			])
		}

		/**
		 * The Models-page footer panel.
		 * @param props - the slot's locale `t` seat plus this plugin's inject face.
		 * @returns the panel element.
		 */
		function ReasoningFooter(props) {
			const t = props.t
			const [state, setState] = React.useState({ phase: 'loading' })
			const [busy, setBusy] = React.useState(false)
			const [notice, setNotice] = React.useState(undefined)
			const [problem, setProblem] = React.useState(undefined)
			const [openRoutes, setOpenRoutes] = React.useState({})

			const applyView = React.useCallback(view => {
				const { editable, skipped } = project(view)
				setState({ phase: 'ready', view, editable, skipped, writable: view.writable !== false })
			}, [])

			const load = React.useCallback(async () => {
				setState({ phase: 'loading' })
				setProblem(undefined)
				setNotice(undefined)
				let answer
				try {
					answer = await props.read()
				} catch (error) {
					setState({ phase: 'error', message: String(error?.message ?? error) })
					return
				}
				if (!answer.ok) {
					setState({ phase: 'error', message: answer.message })
					return
				}
				applyView(answer.view)
			}, [props.read, applyView])

			React.useEffect(() => {
				void load()
			}, [load])

			const writeModels = async (route, models, message) => {
				if (state.phase !== 'ready') return
				setBusy(true)
				setProblem(undefined)
				setNotice(undefined)
				let answer
				try {
					answer = await props.write(route, models, state.view.revision)
				} catch (error) {
					setBusy(false)
					setProblem(String(error?.message ?? error))
					return
				}
				setBusy(false)
				if (!answer.ok) {
					if (answer.conflict) {
						setProblem(t('conflict'))
						void load()
					} else {
						setProblem(answer.message)
					}
					return
				}
				applyView(answer.view)
				setNotice(message)
			}

			const toggleRoute = route => {
				setOpenRoutes(current => ({ ...current, [route]: !current[route] }))
			}

			const heading = h('div', { style: styles.header, key: 'header' }, [
				h('h3', { key: 'title', style: styles.title }, t('title')),
				state.phase === 'ready'
					? h('button', {
						key: 'refresh',
						type: 'button',
						style: { ...styles.secondary, ...styles.small },
						disabled: busy,
						onClick: () => { void load() },
					}, t('refresh'))
					: null,
			])

			if (state.phase === 'loading') {
				return h('section', { style: styles.block }, [heading, h('p', { key: 'hint', style: styles.hint }, t('loading'))])
			}
			if (state.phase === 'error') {
				return h('section', { style: styles.block }, [
					heading,
					h('p', { key: 'error', style: styles.error, role: 'alert' }, state.message),
					h('button', {
						key: 'retry',
						type: 'button',
						style: { ...styles.secondary, ...styles.small, marginTop: '8px' },
						onClick: () => { void load() },
					}, t('refresh')),
				])
			}

			const warns = []
			if (!state.writable) warns.push(t('readOnly'))
			if (state.editable.length === 0) warns.push(t('empty'), t('emptyHint'))

			return h('section', { style: styles.block }, [
				heading,
				h('p', { key: 'hint', style: styles.hint }, t('hint')),
				notice !== undefined ? h('p', { key: 'notice', style: { ...styles.hint, color: 'var(--dsw-alias-label-secondary)' }, role: 'status' }, notice) : null,
				problem !== undefined ? h('p', { key: 'problem', style: { ...styles.hint, color: 'var(--dsw-alias-state-error-primary)' }, role: 'alert' }, problem) : null,
				...warns.map((text, index) => h('p', { key: `warn-${index}`, style: styles.hint }, text)),
				...state.editable.map(provider => h(ProviderSection, {
					key: provider.route,
					provider,
					t,
					busy: busy || !state.writable,
					open: openRoutes[provider.route] === true,
					onToggle: () => toggleRoute(provider.route),
					onSave: (index, efforts) => {
						const models = applyEfforts(provider.models, index, efforts)
						void writeModels(provider.route, models, t('applied'))
					},
					onSaveAll: efforts => {
						const models = applyEffortsToAll(provider.models, efforts)
						void writeModels(provider.route, models, t('appliedAll')(provider.models.length))
					},
				})),
				state.skipped.length > 0 ? h('div', { key: 'skipped', style: { marginTop: '12px' } }, [
					h('div', { key: 'title', style: { fontWeight: 600 } }, t('skippedTitle')),
					h('p', { key: 'hint', style: styles.hint }, t('skippedHint')),
					h('div', { key: 'list', style: styles.route }, state.skipped.map(entry => `${entry.displayName} (${entry.route})`).join(' · ')),
				]) : null,
				h('p', { key: 'save-hint', style: styles.note }, t('saveHint')),
			])
		}

		/**
		 * Services this plugin's browser half reads. `remote.settings` is the
		 * dotted dependency on that namespace; reading `ctx.remote` at all needs
		 * the service itself.
		 */
		const inject = ['slots', 'remote', 'remote.settings', 'locale']

		/**
		 * Register the locale dictionaries and the Models footer panel.
		 * @param ctx - the browser plugin's Cordis context.
		 */
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(COPY_NS, { zh, en }), 'dsh-model-reasoning-effort: copy dictionaries')
			const t = ctx.locale.bind(COPY_NS)

			const api = {
				t,
				read: async () => {
					const response = await ctx.remote.settings.describe()
					if (!response.ok) return { ok: false, message: response.error.message }
					const view = response.value.namespaces.find(candidate => candidate.ns === NS)
					if (view === undefined) return { ok: false, message: t('unavailable') }
					return { ok: true, view: { ...view, writable: response.value.writable } }
				},
				write: async (route, models, revision) => {
					const response = await ctx.remote.settings.mutate(
						NS,
						[{ op: 'set', path: ['providers', route, 'models'], value: models }],
						revision,
					)
					if (response.ok) return { ok: true, view: { ...response.value, writable: true } }
					return {
						ok: false,
						conflict: response.error.code === 'settings/conflict',
						message: response.error.message,
					}
				},
			}

			ctx.slots.inject('settings.models.footer', () => ctx.slots.register({
				name: 'settings.models.footer',
				id: 'model-reasoning-effort',
				order: 40,
				locale: COPY_NS,
				inject: () => api,
			}, ReasoningFooter))
		}

		exports.apply = apply
		exports.inject = inject
		exports.__test = {
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
		}
		return module.exports
	},
})
