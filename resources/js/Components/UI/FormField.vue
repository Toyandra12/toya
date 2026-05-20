<script setup>
/**
 * FormField — labeled input wrapper (UI guidelines §4.5).
 *
 * Implements: default | hover | focus | active | disabled | loading | error
 * - Errors render with role="alert" and link via aria-describedby (A11Y-6).
 * - Helper/error text never conveys meaning by color alone (A11Y-9).
 * - Field height = 44px (h-11) — meets touch-target requirement.
 */
import { computed, getCurrentInstance } from 'vue'

const props = defineProps({
    modelValue:   { type: [String, Number], default: '' },
    label:        { type: String, required: true },
    type:         { type: String, default: 'text' },
    placeholder:  { type: String, default: '' },
    autocomplete: { type: String, default: 'off' },
    helper:       { type: String, default: '' },
    error:        { type: String, default: '' },
    required:     { type: Boolean, default: false },
    disabled:     { type: Boolean, default: false },
    loading:      { type: Boolean, default: false },
    inputmode:    { type: String, default: undefined },
})

const emit = defineEmits(['update:modelValue'])

// Vue 3.4 lacks useId(); fall back to a per-instance unique id.
let _seq = 0
function nextId() { _seq += 1; return _seq }
const fieldId = `field-${getCurrentInstance()?.uid ?? nextId()}`
const helperId = `${fieldId}-helper`
const errorId  = `${fieldId}-error`

const describedBy = computed(() => {
    const ids = []
    if (props.helper && !props.error) ids.push(helperId)
    if (props.error) ids.push(errorId)
    return ids.length ? ids.join(' ') : undefined
})

function onInput(e) {
    emit('update:modelValue', e.target.value)
}
</script>

<template>
    <div class="block">
        <label
            :for="fieldId"
            class="block text-sm font-medium text-fg-secondary mb-t5"
        >
            {{ label }}
            <span v-if="required" class="text-fg-tertiary" aria-hidden="true">*</span>
            <span v-if="required" class="vh">required</span>
        </label>

        <div class="relative">
            <input
                :id="fieldId"
                :type="type"
                :value="modelValue"
                :placeholder="placeholder"
                :autocomplete="autocomplete"
                :inputmode="inputmode"
                :required="required"
                :disabled="disabled"
                :aria-invalid="error ? 'true' : undefined"
                :aria-describedby="describedBy"
                :aria-busy="loading || undefined"
                @input="onInput"
                :class="[
                    'block w-full h-11 px-4 text-md text-fg-primary',
                    'bg-surface-raised border rounded-xs',
                    'placeholder:text-fg-inverse',
                    'transition-colors duration-base ease-base',
                    'hover:border-fg-secondary',
                    'focus:outline-none focus:border-fg-tertiary focus:shadow-t2',
                    error ? 'border-fg-tertiary' : 'border-fg-inverse',
                    disabled ? 'opacity-50 cursor-not-allowed' : '',
                    loading ? 'pr-11' : '',
                ]"
            />

            <span
                v-if="loading"
                class="absolute right-3 top-1/2 -translate-y-1/2 inline-block h-4 w-4 animate-spin rounded-xl border-2 border-fg-inverse border-t-fg-tertiary"
                aria-hidden="true"
            />
        </div>

        <p
            v-if="helper && !error"
            :id="helperId"
            class="mt-t5 text-xs text-fg-inverse"
        >
            {{ helper }}
        </p>

        <p
            v-if="error"
            :id="errorId"
            role="alert"
            class="mt-t5 text-xs text-fg-tertiary flex items-center gap-t5"
        >
            <span aria-hidden="true">⚠</span>
            <span>{{ error }}</span>
        </p>
    </div>
</template>
