// Use `cy.dataCy` custom command for more robust tests
// See https://docs.cypress.io/guides/references/best-practices.html#Selecting-Elements

// ** This file is an example of how to write Cypress tests, you can safely delete it **

// This test will pass when run against a clean Quasar project

describe('My Application', () => {
  it('should navigate to the login page and then to the teams page', () => {
    cy.viewport(1440, 1600)
    cy.visit('http://localhost:9000'); // 访问应用
    cy.url().should('include', '/login'); // 验证是否自动跳转到登录页面

    // 输入用户名和密码
    const username = Cypress.env('E2E_USERNAME');
    const password = Cypress.env('E2E_PASSWORD');

    // 拦截 GraphQL 请求并设置别名
    cy.intercept('POST', 'https://backend.yihu.team/graphql').as('graphqlRequest');
    // 拦截特定的API请求并设置别名
    cy.intercept('GET', 'https://backend.yihu.team/api/users-permissions/user/me/init').as('initUserRequest');

    cy.get('input[aria-label="Email"]').type(username); // 输入用户名
    cy.get('input[aria-label="Password"]').type(password); // 输入用户名
    cy.get('button[type="submit"]').click(); // 提交表单

    // 等待 GraphQL 请求完成
    cy.wait('@graphqlRequest').its('response.statusCode').should('eq', 200); // 验证返回状态码为200

    // 等待3秒的倒计时
    cy.wait(3000); // 登陆倒计时，等待3秒    

    // 等待请求完成
    cy.wait('@initUserRequest').then((interception) => {
      // 验证返回状态码为200
      expect(interception.response.statusCode).to.eq(200);

      // 验证返回的数据中包含email字段，值为 jerr@foxmail.com
      expect(interception.response.body).to.have.property('email', username);
    });

    // 验证是否导航到/teams页面
    cy.url().should('include', '/teams'); // 验证是否导航到团队页面
  });
});

// ** The following code is an example to show you how to write some tests for your home page **
//
// describe('Home page tests', () => {
//   beforeEach(() => {
//     cy.visit('/');
//   });
//   it('has pretty background', () => {
//     cy.dataCy('landing-wrapper')
//       .should('have.css', 'background').and('match', /(".+(\/img\/background).+\.png)/);
//   });
//   it('has pretty logo', () => {
//     cy.dataCy('landing-wrapper img')
//       .should('have.class', 'logo-main')
//       .and('have.attr', 'src')
//       .and('match', /^(data:image\/svg\+xml).+/);
//   });
//   it('has very important information', () => {
//     cy.dataCy('instruction-wrapper')
//       .should('contain', 'SETUP INSTRUCTIONS')
//       .and('contain', 'Configure Authentication')
//       .and('contain', 'Database Configuration and CRUD operations')
//       .and('contain', 'Continuous Integration & Continuous Deployment CI/CD');
//   });
// });
