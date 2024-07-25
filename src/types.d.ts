type Category = {
    id: number,
    categoryId: string,
    position: number,
    questions: Question[],
    translations: Translation[]
}

type Employee = {
    employeeId: number,
    employeeName: string,
    employeeEmail: string,
    departmentId: number
}

type ModulePermission = {
    moduleId: number,
    moduleType: string,
    windowPermissions: WindowPermission[]
}

type Question = {
    id: number,
    questionId: string,
    isRequired: boolean,
    position: number,
    responseType: string,
    translations: Translation[]
}

type Permission = {
    permissionId: number,
    permissionType: string,
    hasPermission: boolean
}

type Profile = {
    idperfil: number,
    nome: string,
    portalColaborador: number
}

type RatingOption = {
    ratingOptionId: string,
    numericValue: number,
    translations: Translation[]
}

type Survey = {
    surveyId: string,
    createdByUserId: number,
    createdDate: string,
    startDate: string,
    endDate: string,
    status: string,
    templateId: string,
    translations: Translation[],
    employees: Employee[],
    surveyEmployeeIds: number[],
    submissionsCompleted: number,
    submissionsTotal: number,
    submissions: any
}

type Template = {
    templateId: string,
    createdDate: string,
    modifiedDate: string,
    createdByUserId: number,
    translations: Translation[],
    categories: Category[],
    ratingOptions: RatingOption[]
}

type Translation = {
    translationId: string,
    language: string,
    title: string,
    description: string
}

type User = {
    userId: number,
    employeeId: number,
    userName: string,
    userEmail: string,
    profileDescription: string,
    profileType: string,
    authorizations: ModulePermission[]
}

type WindowPermission = {
    windowId: number,
    windowType: string,
    permissions: Permission[]
}