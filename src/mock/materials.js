// Демо-данные для макета цепочки "Проектировщик → Согласование →
// Отправка → Получение". Ничего не сохраняется на бэкенде — только
// в памяти вкладки, чтобы показать процесс боссу.
export const smetaPositionsForMaterials = [
  { id: 1, group: 'Фундаментные работы', name: 'Бетонирование фундамента', unit: 'м³' },
  { id: 2, group: 'Фундаментные работы', name: 'Арматура', unit: 'т' },
  { id: 3, group: 'Кровельные работы', name: 'Укладка кровли', unit: 'м²' }
]

export function makeMaterialDraft(positionId, name, unit) {
  return {
    id: `${positionId}-${Date.now()}`,
    position_id: positionId,
    name,
    unit,
    quantity: '',
    status: 'draft', // draft -> on_review -> approved | needs_changes
    comment: ''
  }
}
