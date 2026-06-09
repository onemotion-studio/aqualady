# -*- coding: utf-8 -*-
with open('src/pages/TrainerDashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add newSlotCapacity state
content = content.replace(
    "const [newSlotStart, setNewSlotStart] = useState('')\n  const [newSlotEnd, setNewSlotEnd] = useState('')\n  const [newSlotLabel, setNewSlotLabel] = useState('')",
    "const [newSlotStart, setNewSlotStart] = useState('')\n  const [newSlotEnd, setNewSlotEnd] = useState('')\n  const [newSlotLabel, setNewSlotLabel] = useState('')\n  const [newSlotCapacity, setNewSlotCapacity] = useState('')"
)

# 2. Update addCustomSlot
content = content.replace(
    "setCustomSlots(prev => [...prev, { time: newSlotStart, label, value }])",
    "const capacity = parseInt(newSlotCapacity) || 0\n    setCustomSlots(prev => [...prev, { time: newSlotStart, label, value, capacity }])"
)

# Add setNewSlotCapacity after setNewSlotLabel
content = content.replace(
    "    setNewSlotStart('')\n    setNewSlotEnd('')\n    setNewSlotLabel('')",
    "    setNewSlotStart('')\n    setNewSlotEnd('')\n    setNewSlotLabel('')\n    setNewSlotCapacity('')"
)

# 3. Add capacity input field after opis field
old_input_block = """              <input
                value={newSlotLabel}
                onChange={e => setNewSlotLabel(e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-xl border border-sand/30 text-xs focus:border-teal-brand focus:outline-none"
                placeholder="Opis (opcjonalnie)"
              />
            </div>
            <button"""

new_input_block = """              <input
                value={newSlotLabel}
                onChange={e => setNewSlotLabel(e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-xl border border-sand/30 text-xs focus:border-teal-brand focus:outline-none"
                placeholder="Opis (opcjonalnie)"
              />
              <input
                type="number"
                min="1"
                max="99"
                value={newSlotCapacity}
                onChange={e => setNewSlotCapacity(e.target.value)}
                className="w-24 px-3 py-2.5 rounded-xl border border-sand/30 text-xs focus:border-teal-brand focus:outline-none"
                placeholder="Miejsca"
              />
            </div>
            <button"""

content = content.replace(old_input_block, new_input_block)

with open('src/pages/TrainerDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('OK')
