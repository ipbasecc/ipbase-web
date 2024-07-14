import {useMutation, useQuery} from "@vue/apollo-composable";
import gqlAggregate from "./gql.js"

export function login(params) {
    return useMutation(gqlAggregate.login,()=> (
        { variables: params.value }
    ))
}
// 开始注册流程
// 新建账户
export function register(params) {
    return useMutation(gqlAggregate.register,()=> (
        { variables: params.value }
    ))
}
// 忘记密码
export function forgotPassword(params) {
    return useMutation(gqlAggregate.forgotPassword,()=> (
        { variables: params.value }
    ))
}
// 重设密码
export function resetPassword(params) {
    return useMutation(gqlAggregate.resetPassword,()=> (
        { variables: params.value }
    ))
}
// 新建动态集
export function createPost(params) {
    return useMutation(gqlAggregate.createPost,()=> (
        { variables: params.value }
    ))
}
// 定义用户组
export function updateUsersPermissionsUser(params) {
    return useMutation(gqlAggregate.updateUsersPermissionsUser,()=> (
        { variables: params.value }
    ))
}
// 以上新建过程解释：
// 新建一个基本账号，得到ID后，新建频道并与账号关联，同时返回新建频道ID


export function UpdateChannel(params) {
    return useMutation(gqlAggregate.UpdateChannel,()=> (
        { variables: params.value }
    ))
}

export function updateUsersBasicinfo(params) {
    return useMutation(gqlAggregate.updateUsersBasicinfo,()=> (
        { variables: params.value }
    ))
}

export function findMe() {
    return useQuery(gqlAggregate.findMe)
}

export function findUsers(variables) {
    return useQuery(gqlAggregate.findUsers,variables)
}

export function FindUserMatedate(variables){
    return useQuery(gqlAggregate.FindUserMatedate,variables)
}

export function findChannelMatedataByID(variables,options){
    return useQuery(gqlAggregate.findChannelMatedataByID,variables,options)
}

export function findPostByID(variables){
    return useQuery(gqlAggregate.findPostByID,variables)
}
export function findMessages(variables,options){
    return useQuery(gqlAggregate.findMessages,variables,options)
}
export function findMsgRepliesByMsgId(variables){
    return useQuery(gqlAggregate.findMsgRepliesByMsgId,variables)
}

export function createMessage(params) {
    return useMutation(gqlAggregate.createMessage,()=> (
        { variables: params.value }
    ))
}
export function updateMessage(params) {
    return useMutation(gqlAggregate.updateMessage,()=> (
        { variables: params.value }
    ))
}
export function deleteMessage(params) {
    return useMutation(gqlAggregate.deleteMessage,()=> (
        { variables: params.value }
    ))
}
export function updateWorkingday(params) {
    return useMutation(gqlAggregate.updateWorkingday,()=> (
        { variables: params.value }
    ))
}

// 创建上传文件夹需要后台权限，此方法暂时无用
export function createUploadFolder(params) {
    return useMutation(gqlAggregate.createUploadFolder,()=> (
        { variables: params.value }
    ))
}
export function createUploadFile(params) {
    return useMutation(gqlAggregate.createUploadFile,()=> (
        { variables: params.value }
    ))
}



export function findBizcardsByUserID(variables){
    return useQuery(gqlAggregate.findBizcardsByUserID,variables)
}
export function createBizcard(params) {
    return useMutation(gqlAggregate.createBizcard,()=> (
        { variables: params.value }
    ))
}
export function updateBizcard(params) {
    return useMutation(gqlAggregate.updateBizcard,()=> (
        { variables: params.value }
    ))
}
export function updateUsersDefaultBizcard(params) {
    return useMutation(gqlAggregate.updateUsersDefaultBizcard,()=> (
        { variables: params.value }
    ))
}
export function UpdateBizcardDefaultProvider(params) {
    return useMutation(gqlAggregate.UpdateBizcardDefaultProvider,()=> (
        { variables: params.value }
    ))
}
export function CreateBizcardCollection(params) {
    return useMutation(gqlAggregate.CreateBizcardCollection,()=> (
        { variables: params.value }
    ))
}



export function findElementsItemByAuthorID(variables){
    return useQuery(gqlAggregate.findElementsItemByAuthorID,variables)
}
export function findElementByID(variables){
    return useQuery(gqlAggregate.findElementByID,variables)
}
export function CreateElement(params) {
    return useMutation(gqlAggregate.CreateElement,()=> (
        { variables: params.value }
    ))
}
export function UpdateElement(params) {
    return useMutation(gqlAggregate.UpdateElement,()=> (
        { variables: params.value }
    ))
}
export function DeleteElementByID(params) {
    return useMutation(gqlAggregate.DeleteElementByID,()=> (
        { variables: params.value }
    ))
}


  // 收藏夹
export function findFavoriteItemByID(variables){
    return useQuery(gqlAggregate.findFavoriteItemByID,variables)
}
export function findFavorites(variables){
    return useQuery(gqlAggregate.findFavorites,variables)
}
export function UpdateFavorite(params) {
    return useMutation(gqlAggregate.UpdateFavorite,()=> (
        { variables: params.value }
    ))
}
export function CreateFavorite(params) {
    return useMutation(gqlAggregate.CreateFavorite,()=> (
        { variables: params.value }
    ))
}
export function DeleteFavoriteCol(params) {
    return useMutation(gqlAggregate.DeleteFavoriteCol,()=> (
        { variables: params.value }
    ))
}





export function findElements(variables){
    return useQuery(gqlAggregate.findElements,variables)
}
export function findGategories(variables){
    return useQuery(gqlAggregate.findGategories,variables)
}
export function findTags(variables){
    return useQuery(gqlAggregate.findTags,variables)
}
export function CreateTag(params) {
    return useMutation(gqlAggregate.CreateTag,()=> (
        { variables: params.value }
    ))
}
export function updateFollows(params) {
    return useMutation(gqlAggregate.updateFollows,()=> (
        { variables: params.value }
    ))
}
export function findPopularizes(variables){
    return useQuery(gqlAggregate.findPopularizes,variables)
}


// 项目管理部分

export function findAllProjects(variables){
    return useQuery(gqlAggregate.findAllProjects,variables)
}