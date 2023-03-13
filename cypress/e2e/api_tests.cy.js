///<reference types="cypress"/>
import * as db from '../fixtures/db.json';
import * as login from '../fixtures/login.json';
import * as updateNotExistPost from '../fixtures/updateNotExistPost.json';
import * as createPost from '../fixtures/createPost.json';
import * as updateExistPost from '../fixtures/updateExistPost.json';
import { faker } from '@faker-js/faker';

let postId = db.posts[0].id;
let postBody = db.comments[0].body;
let token;
let idEntity;
updateNotExistPost.posts[0].id = faker.datatype.number({ min: 100000, max: 999999 });
createPost.posts[0].id = faker.datatype.number({min: 1000, max: 2999});
updateExistPost.posts[0].id = faker.datatype.number({min: 1000, max: 2999});
updateExistPost.comments[0].body = faker.lorem.words();
let idEntityFalse = faker.datatype.number({min: 1000, max: 2999});

describe('API tests', () => {
  it('Get all posts', () => {
    cy.log('Get all posts');
    cy.request('GET', `/posts`).then(response => {
      console.log(response)
      expect(response.status).to.be.eq(200);
      expect(response.allRequestResponses[0]["Response Headers"]["content-type"]).to.be.equal("application/json; charset=utf-8")
    })
  })
  it('Get only first 10 posts.', () => {
    cy.log('Get only first 10 posts.');
    cy.request('GET', `/posts?_page=1&_limit=10`).then(response => {
      console.log(response.body)
      let posts = response.body
      expect(response.status).to.be.eq(200);
      expect(posts[0].id).to.be.eq(1)
      expect(posts[1].id).to.be.eq(2)
      expect(posts[2].id).to.be.eq(3)
      expect(posts[3].id).to.be.eq(4)
      expect(posts[4].id).to.be.eq(5)
      expect(posts[5].id).to.be.eq(6)
      expect(posts[6].id).to.be.eq(7)
      expect(posts[7].id).to.be.eq(8)
      expect(posts[8].id).to.be.eq(9)
      expect(posts[9].id).to.be.eq(10)
      expect(posts).to.have.lengthOf.at.most(10)
    })
  })

  it('Get posts with id = 55 and id = 60', () => {
    cy.log('Get posts with id = 55 and id = 60');
    cy.request('GET', `/posts?id=55&id=60`).then(response => {
      console.log(response.body)
      let posts = response.body
      expect(response.status).to.be.eq(200);
      expect(posts[0].id).to.be.eq(55)
      expect(posts[1].id).to.be.eq(60)
    })
  })

  it('Create a post.Unauthorized', () => {
    cy.log('Create a post.Unauthorized');
      cy.request({method: 'POST',
      url: `/664/posts`, 
      body: db,
      failOnStatusCode: false}).then(response => {
        expect(response.status).to.be.eq(401);
      })
    })

  it('Create post with adding access token in header. Verify HTTP response status code. Verify post is created.', () => {
    cy.log('Login to get token Authorization');
    cy.request({
      method: 'POST',
      url: `/login`,
      headers: {
        'Content-Type': 'application/json'
      },
      body: login
    }).then(response => {
      token = response.body.accessToken;
    })
  })
  it('Create post with adding access token in header. Verify HTTP response status code. Verify post is created.', () => {
    cy.log('Create post with adding access token in header.');
    cy.request({
      method: 'POST',
      url: `/664/posts/`,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    }).then(response => {
      expect(response.status).to.be.eq(201);
      expect(response.body.id).to.exist;
    })
  })

  it('Create post entity and verify that the entity is created. Verify HTTP response status code. Use JSON in body.', () => {
    cy.log('Create post entity');
    cy.request({
      method: 'POST',
      url: `/posts`,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: db
    }).then(response => {
      expect(response.status).to.be.eq(201);
      expect(response.allRequestResponses[0]["Response Body"].comments[0].id).to.be.eq(postId)
      expect(response.allRequestResponses[0]["Response Body"].comments[0].body).to.be.eq(postBody)
    })
  })


it(`Update non-existing entity. Verify HTTP response status code.`, () => {
  cy.log('Update non-existing entity');
  cy.request({
    method: 'PUT',
    url: `/posts`,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: updateNotExistPost,
    failOnStatusCode: false
  }).then(response => {
    expect(response.status).to.be.eq(404);
  })
})
  it(`Create post entity and update the created entity. Verify HTTP response status code and verify that the entity is updated.`, () => {
    cy.log('Create post entity');
    cy.request({
      method: 'POST',
      url: `/posts`,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: createPost,
    }).then(response => {
      console.log(response.allRequestResponses[0]["Response Body"].id)
      idEntity = response.allRequestResponses[0]["Response Body"].id
      expect(response.status).to.be.eq(201);
      expect(response.allRequestResponses[0]["Response Body"].posts[0].id).to.be.eq(createPost.posts[0].id)
    
    })
  })
  it(`Create post entity and update the created entity. Verify HTTP response status code and verify that the entity is updated.`, () => {
    cy.log('Update post entity');
    cy.request({
      method: 'PUT',
      url: `/posts/${idEntity}`,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: updateExistPost,
    }).then(response => {
      expect(response.status).to.be.eq(200);
      expect(response.allRequestResponses[0]["Response Body"].comments[0].body).to.be.eq(updateExistPost.comments[0].body);
      expect(response.allRequestResponses[0]["Response Body"].posts[0].id).to.be.eq(updateExistPost.posts[0].id);
    })
  })
  it(`Delete non-existing post entity`, () => {
    cy.log('Delete non-existing post entity');
    cy.request({
      method: 'DELETE',
      url: `/posts/${idEntityFalse}`,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
       failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.be.eq(404);
    })
})


it(`Create post entity, update the created entity, and delete the entity. Verify HTTP response status code and verify that the entity is deleted.`, () => {
  cy.log('Create post entity');
  cy.request({
    method: 'POST',
    url: `/posts`,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: createPost,
  }).then(response => {
    idEntity = response.allRequestResponses[0]["Response Body"].id
    expect(response.status).to.be.eq(201);
    expect(response.allRequestResponses[0]["Response Body"].posts[0].id).to.be.eq(createPost.posts[0].id)
  
  })
})
it(`Create post entity, update the created entity, and delete the entity. Verify HTTP response status code and verify that the entity is deleted.`, () => {
  cy.log('Update post entity');
  cy.request({
    method: 'PUT',
    url: `/posts/${idEntity}`,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: updateExistPost,
  }).then(response => {
    expect(response.status).to.be.eq(200);
    expect(response.allRequestResponses[0]["Response Body"].comments[0].body).to.be.eq(updateExistPost.comments[0].body);
    expect(response.allRequestResponses[0]["Response Body"].posts[0].id).to.be.eq(updateExistPost.posts[0].id);
  })
})
it(`Create post entity, update the created entity, and delete the entity. Verify HTTP response status code and verify that the entity is deleted.`, () => {
  cy.log('Delete non-existing post entity');
  cy.request({
    method: 'DELETE',
    url: `/posts/${idEntity}`,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  }).then(response => {
    expect(response.status).to.be.eq(200);
  })
})
it('Get deleted entity', () => {
  cy.log('Get deleted entity');
  cy.request({
    method: 'GET', 
    url: `/posts/${idEntity}`,
    failOnStatusCode: false
  }
  ).then(response => {
    expect(response.status).to.be.eq(404);
  })
})

})

