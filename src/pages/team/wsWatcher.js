 
import { computed, watch, onMounted, onUnmounted, ref } from "vue";
import { teamStore, notifyStore } from "src/hooks/global/useStore.js";
import { useRouter } from "vue-router";
import { fetchProject } from "src/hooks/project/useProcess.js";
import { cleanCache } from 'src/pages/team/hooks/useAuths.js'
import { useQuasar } from "quasar";
import { useDocumentVisibility, useWindowFocus } from '@vueuse/core'
import { findCard } from "src/api/strapi/project.js";
import { getOneProject } from "src/api/strapi/project.js";
import { leaveRoom } from "src/api/strapi/team.js"
import { hasIntersection } from "src/hooks/utilits.js"
import { toggleTeam } from "src/pages/team/hooks/useTeam.js";
import { $team } from "src/boot/service";

export default function useWatcher() {
  const router = useRouter();
  const $q = useQuasar();

  const val = computed(() => teamStore.income);
  const notify_id = ref(0);
  watch(val, async(newVal, oldVal) => {
    if(!newVal) return;
    console.log('val', val.value);
    let { team_id, project_id, board_id, group_id, card_id, data, notify } = val.value?.data;

    if(val.value.event === 'user:project:joined'){
      // console.log('user:project:joined')
      const index = teamStore.team.projects.findIndex(i => i.id === Number(project_id));

      if(index > -1){
        teamStore.team.projects[index].auth.read = true;
        teamStore.team.projects[index].is_project_member = true;
        teamStore.init.default_team.projects = teamStore.team.projects
      }
    }
    if(val.value.event === 'user:friend:request'){
      console.log('user:friend:request', notify);
      const newMessage = {
        ...notify,
        read: false,
        target: '/chats'
      };
      await notifyStore.addMessage(newMessage);
      const { friend_request } = notify;
      if(friend_request){
        if(teamStore.init?.contact?.friend_requests?.length > 0){
          teamStore.init.contact.friend_requests.push(friend_request);
        } else {
          teamStore.init.contact.friend_requests = [friend_request];
        }
      }
    }
    if(val.value.event === 'user:friend:accept'){
      console.log('user:friend:accept', notify);
      const newMessage = {
        ...notify,
        read: false,
        target: '/chats'
      };
      console.log('newMessage', newMessage);
      await notifyStore.addMessage(newMessage);
      const { friend } = notify;
      if(friend){
        if(teamStore.init?.contact?.contacters?.length > 0){
          teamStore.init.contact.contacters.push(friend);
        } else {
          teamStore.init.contact.contacters = [friend];
        }
      }
    }
    if(val.value.event === 'deal:update:party_b_requirements' || val.value.event === 'deal:update:party_a_requirements'){
      // console.log('deal:update:party_b_requirements', notify);
      const newMessage = {
        ...notify,
        read: false,
        target: `/deliver/deal/${notify.deal_id}`
      };
      console.log('newMessage', newMessage);
      await notifyStore.addMessage(newMessage);
    }

    if(val.value.event === 'project:new_join_request'){
      const data = val.value?.data;
      const {project_id} = data;
      const index = teamStore.team.projects.findIndex(i => i.id === Number(project_id));
      if(index > -1){
        if(teamStore.team.projects[index].join_requests?.length > 0){ 
          teamStore.team.projects[index].join_requests.push(data);
        } else {
          teamStore.team.projects[index].join_requests = [data];
        }
        if(teamStore.project?.id === Number(project_id)){
          teamStore.project.join_requests = teamStore.team.projects[index].join_requests;
        }
      }
    }

    if(teamStore.team?.id === Number(team_id)){
      if(val.value.event === 'team:update'){
        teamStore.team = data;
      }
      if(val.value.event === 'team:delete'){
        teamStore.$reset();
      }
      if(val.value.event === 'team:join'){
        teamStore.team.members.push(data);
      }
      if(val.value.event === 'team:member_updated'){
        if(data.by_user?.id === teamStore.init?.id){
          await toggleTeam(teamStore.team)
        }
        const index = teamStore.team?.members?.findIndex(item => item.id === data.id);
        if(index > -1){
          teamStore.team.members.splice(index, 1, data);

          // 如果当前用户被设置为 未审核 或者 被屏蔽，那么离开对应团队的ws room 并切换团队
          if(data.by_user?.id === teamStore.init?.id){            
            const roles_ids_of_team = teamStore.team.member_roles?.map(i => i.id) || [];
            const unconfirmed_role_ids_of_cur_user = data.member_roles?.filter(i => i.subject === 'unconfirmed')?.map(j => j.id) || [];
            const blocked_role_ids_of_cur_user = data.member_roles?.filter(i => i.subject === 'blocked')?.map(j => j.id) || [];
            
            const noAuth = hasIntersection(roles_ids_of_team, unconfirmed_role_ids_of_cur_user) || hasIntersection(roles_ids_of_team, blocked_role_ids_of_cur_user);
            if(noAuth){
              await leaveRoom(teamStore.team?.id)
            }
          }
        }
      }
      if(val.value.event === 'team:member_leaved'){     
        const curUserMember = teamStore.team.members.find(item => item.by_user.id === teamStore.init?.id);
        if(curUserMember.id === Number(data.leaved_member_id)){
          teamStore.$reset();
        } else {
          teamStore.team.members = teamStore.team.members.filter(item => item.id !== Number(data.leaved_member_id));
        }
      }
      if(val.value.event === 'team:leave'){
        if(Number(data.removed_member_id) === teamStore.init?.id){
          teamStore.$reset();
        } else {
          teamStore.team.members = teamStore.team.members.filter(item => item.id !== Number(data.removed_member_id));
        }
      }
      if(val.value.event === 'board:deleted'){
        if(teamStore.project?.id === Number(project_id)){
          teamStore.project.boards = teamStore.project.boards.filter(item => item.id !== Number(data.removed_board));
        }
        if(teamStore.board?.id === Number(data.removed_board)){
          teamStore.board = void 0;
        }
      }
      if(val.value.event === 'board:created'){
        if(teamStore.project?.id === Number(project_id)){
          teamStore.project.boards.push(data);
        }
      }
      if(val.value.event === 'board:updated'){
        if(teamStore.project?.id === Number(project_id)){
          const index = teamStore.project.boards.findIndex(item => item.id === Number(data.id));
          if(index > -1){
            teamStore.project.boards[index] = data;
          }
        }
        if(teamStore.board?.id === Number(data.id)){
          teamStore.board = data;
        }
      }
      if(val.value.event === 'group:created'){
        if(teamStore.board?.id === Number(board_id)){
          teamStore.board.groups.push(data);
          const index = teamStore.project.boards.findIndex(item => item.id === Number(board_id));
          if(index > -1){
            teamStore.project.boards[index] = teamStore.board;
          }
        }
      }
      if(val.value.event === 'group:updated'){
        const groupIndex = teamStore.board?.groups?.findIndex(item => item.id === Number(data.id));
        if(groupIndex > -1){
          teamStore.board.groups[groupIndex] = data;
        }
        const index = teamStore.project.boards?.findIndex(item => item.id === Number(board_id));
        if(index > -1){
          teamStore.project.boards[index] = teamStore.board;
        }
      }
      if(val.value.event === 'group:deleted'){
        if(teamStore.kanban){
          const index = teamStore.board?.groups?.findIndex(item => item.id === Number(data.removed_group));
          if(index > -1){
            const kanbanIn = teamStore.board.groups[index].kanbans?.find(item => item.id === teamStore.kanban.id);
            if(kanbanIn){
              teamStore.kanban = void 0;
              router.push(`/teams/projects/${teamStore.project?.id}/${teamStore.navigation}`);
            }
          }
        }
        if(teamStore.board){
          teamStore.board.groups = teamStore.board.groups.filter(item => item.id !== Number(data.removed_group));
        }
        teamStore.project.boards = teamStore.project.boards.map(board => {
          return {
            ...board,
            groups: board.groups.filter(item => item.id !== Number(data.removed_group))
          }
        })
      }
      if(val.value.event === 'group:order'){
        const index = teamStore.project.boards?.findIndex(item => item.id === Number(board_id));
        if(index > -1){
          teamStore.project.boards[index].groups = data.group_order.map(item => {
            return teamStore.project.boards[index].groups.find(i => i.id === Number(item));
          });
          if(teamStore.board?.id === Number(board_id)){
            teamStore.board.groups = data.group_order.map(i => teamStore.board.groups.find(item => item.id === Number(i)));
          }
        }
      }
      if(val.value.event === 'kanban:created'){
        teamStore.project.boards = teamStore.project.boards.map((board) => {
          let cur_board_id;
          const _board =  {
            ...board,
            groups: board.groups.map(group => {
              if(group.id === Number(group_id)){
                cur_board_id = board.id;
                return {
                  ...group,
                  kanbans: group.kanbans?.length > 0 ? [...group.kanbans, data] : [data]
                }
              }
              return group;
            })
          }
          console.log('_board', _board);
          if(teamStore.board?.id === cur_board_id){
            teamStore.board = _board;
          }
          return _board;
        })
      }
      const { order } = val.value?.data;
      if(val.value.event === 'kanban:updated' && !order) {
        teamStore.project.boards = teamStore.project.boards?.map(board => {
          let cur_board_id;
          const _board = {
            ...board,
            groups: board.groups?.map(group => {
              return {
                ...group,
                kanbans: group.kanbans?.map((kanban) => {
                  if (kanban.id === Number(data.id)) {
                    return data;
                  } else {
                    return kanban;
                  }
                })
              };
            })
          };
          if (teamStore.board && teamStore.board.id === cur_board_id) {
            teamStore.board = _board;
          }
          return _board;
        });
      }
      if(val.value.event === 'kanban:deleted') {
        teamStore.project.boards = teamStore.project.boards?.map(board => {
          return{
            ...board,
            groups: board.groups?.map(group => {
              return {
                ...group,
                kanbans: group.kanbans.filter(i => i.id !== Number(data.removed_kanban))
              };
            })
          };
        });
        if(teamStore.board?.groups){
          teamStore.board.groups = teamStore.board.groups.map(group => {
            return {
              ...group,
              kanbans: group.kanbans.filter(i => i.id !== Number(data.removed_kanban))
            };
          });
        }
      }

      if(val.value.event === 'channel:channel_created'){
        if(teamStore.team?.team_channels?.length > 0){
          teamStore.team.team_channels.push(data);
        } else {
          teamStore.team.team_channels = [data];
        }
      }
      if(val.value.event === 'channel:channel_deleted'){
        if(teamStore.team?.team_channels?.length > 0){
          teamStore.team.team_channels = teamStore.team?.team_channels?.filter(i => i.id !== Number(data.channel_id));
        }
      }
      if(val.value.event === 'channel:channel_updated'){      
        const index = teamStore.team.team_channels.findIndex(i => i.id === Number(data.id));
        if(index > -1){
          teamStore.team.team_channels[index] = data;
        }
      }
      if(val.value.event === 'channel:member_leaved'){
        const index = teamStore.team.team_channels.findIndex(i => i.id === Number(data.channel_id));
        if(index > -1){
          teamStore.team.team_channels[index].members = teamStore.team.team_channels[index].members.filter(i => i.id !== Number(data.leaved_member_id));
          if(teamStore?.mm_channel?.id === teamStore.team.team_channels[index].mm_channel?.id){
            teamStore.mm_channel = void 0;
            router.push('/teams');
          }
        }
        const curUserMember = teamStore.team?.members?.find(i => i.by_user.id === teamStore.init?.id);
        if(curUserMember?.id === Number(data.leaved_member_id)){
          teamStore.team.team_channels = teamStore.team.team_channels.filter(i => i.id !== Number(data.channel_id));
        }
      }
      if(val.value.event === 'channel:member_updated'){
        const index = teamStore.team.team_channels.findIndex(i => i.id === Number(data.id));
        if(index > -1){
          teamStore.team.team_channels[index] = data;
          teamStore.channel = data;
        } else {
          console.log('!!!!_inChannel', data);
          teamStore.team.team_channels.push(data);
        }
      }
      if(val.value.event === 'channel:member_join'){    
        const index = teamStore.team.team_channels.findIndex(i => i.id === Number(data.channel_id));
        if(index > -1){
          teamStore.team.team_channels[index].members.push(data.joined_member);
        }
  
        const _teamMemberIndex = teamStore.team?.members?.findIndex(i => i.id === Number(data.joined_member?.id));
        if(_teamMemberIndex > -1){
          teamStore.team.members[_teamMemberIndex] = data.joined_member;
        } else {
          teamStore.team.members.push(data.joined_member);
        }
      }
      if(val.value.event === 'project:project_created'){
        let _project = data.project
        const isCreator = data.project.project_members.find(i => i.by_user.id === teamStore.init?.id);
        if(!isCreator){
          _project = {
            id: _project.id,
            name: _project.name,
            overviews: _project.overviews,
            auth: {
                read: false
            }
          }
        }
        if(teamStore.team.projects?.length > 0){
          teamStore.team.projects.push(_project);
        } else {
          teamStore.team.projects = [_project];
        }
        // 防止被多次触发
        // 不能在最后统一设置，因为有些操作可能需要旧数据
        teamStore.income = null;
      }
      if(val.value.event === 'project:project_modify'){
        let _project
        const res = await getOneProject(project_id);
        if(res?.data){
          _project = res.data;
        }
        if(teamStore.project?.id === Number(project_id)){
          teamStore.project = _project;
        }
        if(teamStore.buy_project?.id === Number(project_id)){
          teamStore.buy_project = _project;
        }
        const index = teamStore.team.projects.findIndex(i => i.id === Number(project_id));
        if(index > -1){
          teamStore.team.projects[index] = _project;
        }
      }

      if(val.value.event === 'project:project_deleted'){
        
        teamStore.team.projects = teamStore.team.projects.filter(i => i.id !== Number(data.project_id));
        if(teamStore.project?.id === Number(data.project_id)){
          teamStore.$reset_project();
          router.push("/teams");
        }
      }
      if(val.value.event === 'project:project_achived'){
        teamStore.team.projects = teamStore.team.projects.filter(i => i.id !== Number(data.project_id));
        if(teamStore.project?.id === Number(data.project_id)){
          teamStore.$reset_project();
          router.push("/teams");
        }
      }
      if(val.value.event === 'project:join'){
        teamStore.project.project_members = teamStore.project?.project_members || [];
        const index = teamStore.team.projects.findIndex(i => i.id === Number(project_id));
        if(teamStore.project.id === Number(project_id)){
          teamStore.project.project_members.push(data.member);
          teamStore.team.projects[index].project_members = teamStore.project.project_members;
        } else {
          teamStore.team.projects[index].project_members.push(data.member);
        }

        const _teamMemberIndex = teamStore.team?.members?.findIndex(i => i.id === Number(data.member?.id));
        if(_teamMemberIndex > -1){
          teamStore.team.members[_teamMemberIndex] = data.member;
        } else {
          teamStore.team.members.push(data.member);
        }
      }
      if(val.value.event === 'project:leave'){
        const curUserMember = teamStore.team.members.find(i => i.by_user.id === teamStore.init?.id);
        // console.log('curUserMember', curUserMember);
        const index = teamStore.team.projects.findIndex(i => i.id === Number(project_id));
        teamStore.team.projects[index].project_members = teamStore.team.projects[index].project_members.filter(i => i.id !== Number(data.removeMember_id));
        const membersIDs_by_leave = teamStore.team.projects[index].project_members.map(i => i.id);
        // console.log(membersIDs_by_leave, curUserMember.id, typeof membersIDs_by_leave, typeof curUserMember.id);
        if(!membersIDs_by_leave.includes(curUserMember.id)){
          let _i = teamStore.team.projects[index]
          teamStore.team.projects[index] = {
            id: _i.id,
            name: _i.name,
            overviews: _i.overviews,
            auth: {
              read: false
            },
            allow_join_requests: _i.allow_join_requests
          }
          if(teamStore.project.id === Number(project_id)){
            teamStore.$reset_project();
            router.push("/teams");
          }
        } else if(teamStore.project.id === Number(project_id)) {
          teamStore.project.project_members = teamStore.team.projects[index].project_members
        }

        const _teamMemberIndex = teamStore.team?.members?.findIndex(i => i.id === Number(data.member?.id));
        if(_teamMemberIndex > -1){
          teamStore.team.members[_teamMemberIndex] = data.member;
        }
      }
      if(val.value.event === 'project:member_updated'){
        const pindex = teamStore.team.projects.findIndex(i => i.id === Number(project_id));
        if(!teamStore.team.projects[pindex].auth?.read){          
          const fetch = await fetchProject(project_id);
          if (fetch) {
            teamStore.team.projects[pindex] = fetch;
          }
        } else {
          const mindex = teamStore.team.projects[pindex].project_members.findIndex(i => i.id === Number(data.member?.id));
          if(mindex > -1){
            teamStore.team.projects[pindex].project_members[mindex] = data.member;
            if(teamStore.project?.id === Number(project_id)){
              teamStore.project.project_members[mindex] = data.member;
            }
          } else {
            teamStore.team.projects[pindex].project_members.push(data.member);
            teamStore.project.project_members = teamStore.team.projects[pindex].project_members;
          }
        }

        const _teamMemberIndex = teamStore.team?.members?.findIndex(i => i.id === Number(data.member?.id));
        if(_teamMemberIndex > -1){
          teamStore.team.members[_teamMemberIndex] = data.member;
        }
      }
      if(val.value.event === 'overview:created'){
        
        if (project_id) {
          if(project_id === teamStore.project?.id){
            if (teamStore.project?.overviews?.length > 0) {
              teamStore.project.overviews.push(data);
            } else {
              teamStore.project.overviews = [data];
            }
          }
          teamStore.init.default_team?.projects?.forEach(i => {
            if(i.id === Number(project_id)){
              if(i.overviews?.length > 0){
                i.overviews.push(data);
              } else {
                i.overviews = [data];
              }
            }
          })
        }
        if(card_id) {
          const is_sale_type = $team().saleTypes.includes(data.card?.type);
          const is_creator = teamStore.init?.id === data.card?.creator?.id;
          // 当新增overview的卡片是课堂时，只需要更新已经打开详情的card的overviews即可，因为课堂卡片在分栏中只显示封面
          if(is_sale_type && !is_creator && teamStore.card?.id === data.card.id){
            const res = await findCard(card_id);
            if(res?.data){
              if(teamStore.card?.id === res.data.id){
                teamStore.card.overviews = res.data.overviews
              }
            }
            return // 提前返回，后续不需要继续执行了
          }
          if(is_sale_type) return

          if (card_id === teamStore.card?.id) {
            if (teamStore.card?.overviews?.length > 0) {
              teamStore.card.overviews.push(data);
            } else {
              teamStore.card.overviews = [data];
            }
          }
          // 定义 process_overview 函数
          const process_overview = (columns) => {
            return columns.map(i => {
              i.cards = i.cards.map(j => {
                if(j.id === card_id){
                  if(j.overviews?.length > 0){
                    j.overviews.push(data);
                  } else {
                    j.overviews = [data];
                  }
                }
                return j;
              })
              return i;
            })
          }

          // 定义 hasCard 函数
          const hasCard = (columns) => {
            if(!columns || columns.length === 0) return false;
            return columns?.map(i => i.cards)?.flat(2)?.map(j => j.id)?.includes(card_id)
          }
          // 使用 forEach 来遍历数组并使用索引更新原数组
          [teamStore.kanban?.columns, teamStore.cardKanban?.columns, teamStore.dropKanban?.columns].forEach((columns, index) =>{
            if(hasCard(columns)){
              const updatedColumns = process_overview(columns);
              // 使用索引来更新原数组
              [teamStore.kanban?.columns, teamStore.cardKanban?.columns, teamStore.dropKanban?.columns][index] = updatedColumns;
            }
          });
        }
      }
      if(val.value.event === 'overview:deleted'){

        // 当移除overview的卡片是课堂时，只需要更新已经打开详情的card的overviews即可，因为课堂卡片在分栏中只显示封面
        if(data.card?.type === 'classroom' && teamStore.card?.id === data.card.id){
          teamStore.card.overviews = teamStore.card.overviews.filter(i => i.id !== Number(data.removed_overview))
          return // 提前返回，后续不需要继续执行了
        }
        if(data.card?.type === 'classroom') return

        const isIn = (overviews) => {
          if (!overviews || overviews.length === 0) return false;
          return overviews.map(i => i.id).includes(Number(data.removed_overview));
        };
        
        const remove_overview = (overviews) => {
          return overviews.filter(i => i.id !== Number(data.removed_overview));
        };
        
        // 使用 nullish coalescing 操作符确保 overviews 不为 undefined
        const overviewsArray = [teamStore.project?.overviews, teamStore.card?.overviews];
        overviewsArray.forEach((overviews, index) => {
          if (overviews && isIn(overviews)) {        
            const _updatedOverviews = remove_overview(overviews);
            // 使用索引来更新原数组
            if (index === 0) {
              teamStore.project.overviews = _updatedOverviews;
            } else if (index === 1) {
              teamStore.card.overviews = _updatedOverviews;
            }
          }
        });

        const isTargetCard = (columns) => {
          if(!columns || columns.length === 0) return false
          const cards = columns.map(i => i.cards).flat(2);
          if(!cards || cards.length === 0) return false
          const overviews = cards.map(i => i.overviews).flat(2);
          if(!overviews || overviews.length === 0) return false

          return columns
            .map(i => i.cards?.map(j => j.overviews?.map(k => k.id)))
            .flat(3)
            .map(j => j.id)
            .includes(Number(data.removed_overview))
        }
        // 定义 process_overview 函数
        const process_overview = (columns) => {
          return columns.map(i => {
            return {
              ...i,
              cards: i.cards.map(j => {
                return {
                  ...j,
                  overviews: j.overviews?.filter(k => k.id !== Number(data.removed_overview))
                }
              })
            }
          })
        }
        // 使用 forEach 来遍历数组并使用索引更新原数组
        [teamStore.kanban?.columns, teamStore.cardKanban?.columns, teamStore.dropKanban?.columns].forEach((columns, index) =>{
          if(isTargetCard(columns)){
            const updatedColumns = process_overview(columns);
            // 使用索引来更新原数组
            [teamStore.kanban.columns, teamStore.cardKanban.columns, teamStore.dropKanban.columns][index] = updatedColumns;
          }
        });
      }
      if(val.value.event === 'overview:updated'){
        // 如果是课堂内容，那么后端返回的数据不会包含media相关字段
        // 这里重新请求数据，由于课堂卡片不会在分栏中显示媒体，所以不需要执行更新媒体的操作
        // 只需要更新正在查看详情详情内容

        // 当更新overviews的卡片是销售内容时，只需要更新已经打开详情的card的overviews即可，因为课堂卡片在分栏中只显示封面
        const is_sale_type = $team().saleTypes.includes(data.card?.type);
        const is_creator = teamStore.init?.id === data.card?.creator?.id;
        if(is_sale_type && !is_creator && teamStore.card?.id === data.card.id){
          const res = await findCard(data.card.id);
          if(res?.data){
            if(teamStore.card?.id === res.data.id){
              teamStore.card = res.data
              teamStore.card.activeVersion = teamStore.card.overviews.find(i => i.id === data.id)
            }
          }
          return // 提前返回，后续不需要继续执行了
        }
        if(is_sale_type) return

        const isIn = (overviews) => {
          if (!overviews || overviews.length === 0) return false;
          return overviews.map(i => i.id).includes(Number(data.id));
        };
        
        const update_overview = (overviews, index) => {
          return overviews.map(i => {
            if(i.id === Number(data.id)){
              if(index === 0){
                teamStore.project.activeVersion = data;
              } else if(index === 1){
                teamStore.card.activeVersion = data;
              }
              return data
            } else {
              return i
            }
          })
        };
        
        // 使用 nullish coalescing 操作符确保 overviews 不为 undefined
        const overviewsArray = [teamStore.project?.overviews, teamStore.card?.overviews];
        overviewsArray.forEach((overviews, index) => {
          if (overviews && isIn(overviews)) { 
            console.log('forEach',overviews);
                   
            const _updatedOverviews = update_overview(overviews, index);
            // 使用索引来更新原数组
            if (index === 0) {
              teamStore.project.overviews = _updatedOverviews;
              console.log('project',_updatedOverviews);
            } else if (index === 1) {
              teamStore.card.overviews = _updatedOverviews;
              console.log('card',_updatedOverviews);
            }
          }
        });

        const isTargetCard = (columns) => {
          if(!columns || columns.length === 0) return false
          const cards = columns.map(i => i.cards).flat(2);
          if(!cards || cards.length === 0) return false
          const overviews = cards.map(i => i.overviews).flat(2);
          if(!overviews || overviews.length === 0) return false

          return columns
            .map(i => i.cards?.map(j => j.overviews?.map(k => k.id)))
            .flat(3)
            .map(j => j.id)
            .includes(Number(data.id))
        }
        // 定义 process_overview 函数
        const process_overview = (columns) => {
          return columns.map(i => {
            return {
              ...i,
              cards: i.cards.map(j => {
                return {
                  ...j,
                  overviews: j.overviews?.map(k => {
                    if(k.id === Number(data.id)){
                      return data
                    } else {
                      return k
                    }
                  })
                }
              })
            }
          })
        }
        // 使用 forEach 来遍历数组并使用索引更新原数组
        [teamStore.kanban?.columns, teamStore.cardKanban?.columns, teamStore.dropKanban?.columns].forEach((columns, index) =>{
          if(isTargetCard(columns)){
            const updatedColumns = process_overview(columns);
            // 使用索引来更新原数组
            [teamStore.kanban.columns, teamStore.cardKanban.columns, teamStore.dropKanban.columns][index] = updatedColumns;
          }
        });
      }
      
      if(val.value.event === 'document:created'){
        console.log('document:created', val.value);
        if(teamStore.project?.id === Number(project_id)){
          if(teamStore.project.project_documents?.length > 0){
            const index = teamStore.project.project_documents.findIndex(i => i.id === data.id)
            if(index === -1){
              teamStore.project.project_documents.push(data);
            }
          } else {
            teamStore.project.project_documents = [data]
          }
        }
        if(teamStore.card?.id === Number(card_id)){
          console.log('document:created');
          
          if(teamStore.card.card_documents?.length > 0){
            const index = teamStore.card.card_documents.findIndex(i => i.id === data.id)
            if(index === -1){
              teamStore.card.card_documents.push(data);
            }
          } else {
            teamStore.card.card_documents = [data]
          }
        }
      }
      if(val.value.event === 'document:updated'){
        const _document_id = data?.id;
        const isOpened = () => {
          if(!teamStore.active_document || !_document_id) return false
          return teamStore.active_document.id === _document_id
        }
        if(isOpened()){
          const visibility = useDocumentVisibility();
          const focused = useWindowFocus()
          const { updator } = val.value?.data;
          // 窗口失焦或者标签页不可见，直接修改
          if (!focused.value || !visibility) {
            teamStore.active_document = data;
            return
          }
          // 更新者不是当前用户，提示有更新
          if(updator !== teamStore.init?.id) {
            $q.notify({
              color: 'positive',
              position: 'top',
              message: '当前文档有更新，是否显示最新内容？',
              timeout: 0,
              closeBtn: true,
              actions: [
                { label: 'Reply', noCaps: true, color: 'yellow', handler: () => {
                  teamStore.active_document = data;
                }},
              ]
            })
          } else {
            // 是当前更新者在更新
            // 更新除了jsonContent字段外的其它字段内容，因为编辑器内的内容已经是保存内容了
            // 有可能是在更新其它字段
            // return
            for (const key in data) {
              // 检查字段是否不是jsonContent
              if (key !== 'jsonContent') {
                // 将data的字段值赋给teamStore.active_document的对应字段
                teamStore.active_document[key] = data[key];
              }
            }
          }
        }
        if(teamStore.project?.id === Number(project_id)){
          const index = teamStore.project.project_documents.findIndex(i => i.id === Number(data.id));
          if(index !== -1){
            teamStore.project.project_documents[index] = data;
          }
        }
        if(teamStore.card?.id === Number(card_id)){
          const index = teamStore.card.card_documents.findIndex(i => i.id === Number(data.id));
          if(index !== -1){
            teamStore.card.card_documents[index] = data;
          }
        }
      }
      if(val.value.event === 'document:removed'){
        console.log('document:removed', data);
        if(teamStore.project?.id === Number(project_id)){
          const index = teamStore.project.project_documents.findIndex(i => i.id === Number(data.removed_document_id));
          if(index !== -1){
            teamStore.project.project_documents.splice(index, 1);
            router.push(`/teams/projects/${teamStore.project.id}/document`);
          }
        }
        if(teamStore.card?.id === Number(card_id)){
          console.log('document:removed', data);
          const index = teamStore.card.card_documents.findIndex(i => i.id === Number(data.removed_document_id));
          if(index !== -1){
            teamStore.card.card_documents.splice(index, 1);
          }
        }
        if(teamStore.active_document?.id === data.removed_document_id){
          teamStore.active_document = null;
        }
      }

      if(val.value.event === 'storage:created'){
        if(teamStore.project?.id === Number(project_id)){
          let storages = teamStore.project.storages;
          if(storages?.length > 0){
            storages.push(data)
          } else {
            storages = [data]
          }
        }
        if(teamStore.card?.id === Number(card_id)){
          teamStore.card.storage = data;
        }
      }

      if(val.value.event === 'schedule:created'){
        if(teamStore.project?.id === Number(project_id)){
          teamStore.project.schedules.push(data);
        }
        if(teamStore.card?.schedule.id === Number(card_id)){
          teamStore.card.schedule = data;
        }
      }
      if(val.value.event === 'schedule:deleted'){
        if(teamStore.project?.schedules?.map(i => i.id).includes(Number(data.removed_schedule_id))){
          const index = teamStore.project.schedules.findIndex(i => i.id === Number(data.removed_schedule_id));
          if(index !== -1){
            teamStore.project.schedules.splice(index, 1);
          }
        }
        if(teamStore.card?.schedule?.id === Number(data.removed_schedule_id)){
          teamStore.card.schedule = null;
        }
      }
      if(val.value.event === 'schedule:updated'){
        if(teamStore.project?.schedules?.map(i => i.id).includes(Number(data.id))){
          const index = teamStore.project.schedules.findIndex(i => i.id === Number(data.id));
          if(index !== -1){
            teamStore.project.schedules[index] = data;
          }
        }
        if(teamStore.card?.schedule?.id === Number(data.id)){
          teamStore.card.schedule = data;
        }
      }

      if(val.value.event === 'event:created'){
        const { schedule_id } = val.value.data;
        const _project_schedules_ids = teamStore.project?.schedules?.map(i => i.id);
        if (_project_schedules_ids?.includes(Number(schedule_id))) {
          teamStore.project = {
            ...teamStore.project,
            schedules: teamStore.project.schedules.map((i) => {
              if(i.id === Number(schedule_id)){
                return {
                  ...i,
                  schedule_events: [...i.schedule_events, data],
                }
              } else {
                return i;
              }
            }),
          };
        }
        if (teamStore.card?.schedule?.id === Number(schedule_id)) {
          teamStore.card?.schedule?.schedule_events.push(data);
        }
      }
      if(val.value.event === 'event:updated'){
        const { schedule_id } = val.value.data;
        const _project_schedules_ids = teamStore.project?.schedules?.map(i => i.id);
        if (_project_schedules_ids?.includes(Number(schedule_id))) {
          teamStore.project.schedules = teamStore.project.schedules.map((i) => {
            if(i.id === Number(schedule_id)){
              return {
                ...i,
                schedule_events: i.schedule_events.map((j) => {
                  if(j.id === Number(data.id)) {
                    return data;
                  } else {
                    return j;
                  }
                })
              }
            } else {
              return i;
            }
          })
        }
        if (teamStore.card?.schedule?.id === Number(schedule_id)) {
          if(teamStore.card?.schedule?.schedule_events?.length > 0){
            teamStore.card.schedule.schedule_events.forEach((i) => {
              if(i.id === data.id){
                i = data;
              }
            })
          } else {
            teamStore.card.schedule.schedule_events = [data];
          }
        }
      }
      if(val.value.event === 'event:deleted'){
        const { schedule_id } = val.value.data;
        const _project_schedules_ids = teamStore.project?.schedules?.map(i => i.id);
        if (_project_schedules_ids?.includes(Number(schedule_id))) {
          teamStore.project.schedules = teamStore.project.schedules.map((i) => {
            if(i.id === Number(schedule_id)){
              return {
                ...i,
                schedule_events: i.schedule_events.filter((j) => j.id !== Number(data.removed_event_id)),
              }
            } else {
              return i;
            }
          });
        }
        if (teamStore.card?.schedule?.id === Number(schedule_id)) {
          teamStore.card.schedule.schedule_events = teamStore.card?.schedule?.schedule_events.filter((i) => i.id !== Number(data.removed_event_id));
        }
      }

      if(val.value.event === 'member-role:created'){
        if(project_id && teamStore.project?.id === Number(project_id)){
          teamStore.project.member_roles.push(data);
        }
        if(card_id && teamStore.card?.id === Number(card_id)){
          teamStore.card.member_roles.push(data);
        }
        cleanCache();
      }
      if(val.value.event === 'member-role:removed'){
        if(teamStore.project){
          const index = teamStore.project?.member_roles?.findIndex(i => i.id === Number(data.removed_role_id));
          if(index !== -1){
            teamStore.project.member_roles.splice(index, 1);
          }
        }
        if(teamStore.card){
          const index = teamStore.card?.member_roles?.findIndex(i => i.id === Number(data.removed_role_id));
          if(index !== -1){
            teamStore.card.member_roles.splice(index, 1);
          }
        }
        cleanCache();
      }
      if(val.value.event === 'member-role:updated'){
        if(teamStore.project?.id === Number(project_id)){
          const index = teamStore.project?.member_roles?.findIndex(i => i.id === Number(data.id));
          if(index !== -1){
            teamStore.project.member_roles[index] = data;
          }
        }
        if(teamStore.card?.id === Number(card_id)){
          const index = teamStore.card?.member_roles?.findIndex(i => i.id === Number(data.id));
          if(index !== -1){
            teamStore.card.member_roles[index] = data;
          }
        }
        cleanCache();
      }
    }
  },{ immediate: true, deep: true });

  const handleVisibilityChange = (val) => {
    if(!val) return;
      teamStore.active_document = val;
    if (window.document.visibilityState === 'hidden') {
    }
  }
    // 监听标签页的可见性变化
  let visibilityListenerAdded = false;
  onMounted(() => {
    window.document.addEventListener('visibilitychange', handleVisibilityChange);
    visibilityListenerAdded = true;
  });

  onUnmounted(() => {
    if (visibilityListenerAdded) {
      window.document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  });
}
