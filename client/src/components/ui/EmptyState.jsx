const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    {Icon && <Icon className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />}
    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h3>
    {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;

