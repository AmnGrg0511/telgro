import React from 'react';
import Quiz from './components/quizdata';
import { BrowserRouter, Switch, Route, withRouter } from 'react-router-dom';
import { Topics } from './pages/Topics';
import { Subtopics } from './pages/Subtopics';
import { AddQuestion } from './components/AddQuestion';
import { Navbar } from './components/Navbar';
import { Admin } from './pages/Admin';
import { Moderator } from './pages/Moderator';
import { AddResources } from './pages/AddResources';
import styled from 'styled-components';
import { ValidateModerators } from './components/ValidateModerators';
import { ValidateQuestions } from './components/ValidateQuestions';
import { ValidateResources } from './components/ValidateResources';
import { Profile } from './pages/Profile';
import { Posts } from './pages/Posts';
import { Syllabus } from './pages/Syllabus';
import { ShowSubtopic } from './pages/ShowSubtopic';
import Login from './Login';
import { AddTopic } from './pages/AddTopic';
import {AddSubtopic} from './pages/AddSubtopic';
import {AddTag} from './pages/AddTag';
import {MyCustomTest} from './components/MyCustomTest';
import {MyCourse} from './components/MyCourse';
import { ShowUnverifiedQuestions } from './components/VerifyQuestions';
import CustomQuiz from './components/CustomQuiz';
import { ModuleList } from './pages/ModuleList';
import { Module } from './pages/Module';
import { Courses } from './pages/Courses';
import { Course } from './pages/Course';
import { ManageUsers } from './pages/ManageUsers';
import { ManageUserPermissions } from './pages/ManageUserPermissions';
import { CreateTestWithModule } from './pages/CreateTestWithModule';
import { SimilarQuestions } from './pages/SimilarQuestion';
import { ManageBatch } from './pages/ManageBatch';
import { AddUserToBatch } from './pages/AddUserToBatch';
import { ManageModule } from './pages/ManageModule';
import { AddTopicToModule } from './pages/AddTopicToModule'
import { CustomTestsList } from './components/CustomTestList';
import { CustomTest } from './components/CustomTest'
import {MyCustomTestsList} from './components/MyCustomTestsList';
import {MyCourseList} from './components/MyCourseList';
import {ValidatePosts} from './components/ValidatePosts';
import {PastTest} from './components/PastTest';
import {AnalyseBatch} from './components/AnalyseBatch';
import {Notifications} from './components/Notifications';
import { EditCustomTest } from './components/EditCustomTest';
import { Post } from './components/Post';
import { EditPost } from './components/EditPost.js';
import { Discussion } from './pages/Discussion';
import { DiscussionQuestion } from './pages/DiscussQuestion';
import { Code } from './components/Code';

const Layout = styled.div`
	display: grid;
	grid-template-rows: auto 1fr;
	height: 100%;
`;

function Hero() {
	return (
		<BrowserRouter>
			<Layout>
				<Navbar />

				<Switch>
					<Route exact path="/" component={Topics}  />
					<Route exact path="/login" component={Login}  />
					<Route exact path="/module" component={ModuleList} />
					<Route exact path="/add-modules" 
						render = {() => <ModuleList addModule = {true}/>}/>
					<Route exact path="/module/:moduleName" component={Module} />
					<Route exact path="/module/:moduleName/:topic" component={Subtopics} />
					<Route exact path="/module/:moduleName/:topic/:subtopic" component={ShowSubtopic} />
					<Route exact path="/module/:moduleName/:topic/:subtopic/with-tag/:tag" component={ShowSubtopic} />
					<Route exact path="/manage-users" component={ManageUsers} />
					<Route exact path="/manage-users/:userId" component={ManageUserPermissions} />
					<Route exact path="/course/:courseId" component={Course}  />
					<Route exact path="/courses" component={Courses}  />
					<Route exact path="/add-courses" 
						render = {() => <Courses addCourse = {true}/>}/>
					<Route exact path="/manage-module" component={ManageModule} />
					<Route exact path="/manage-module/:module/add-topic" component={AddTopicToModule} />
					
					<Route exact path="/manage-batch/:batch" component={ManageBatch}/>
					<Route exact path="/manage-batch/:batch/add-user" component={AddUserToBatch}/>
					
					<Route exact path="/validate-users" component={ValidateModerators} />
					<Route exact path="/module/:module/validate-questions/:topic/:subtopic" component={ValidateQuestions} />

					<Route exact path="/module/:module/validate-resources/:topic/:subtopic" component={ValidateResources} />
					<Route exact path="/similar-question/:quesId" component={SimilarQuestions}/>

					<Route
						exact path="/discuss/:subtopic"
						component={Discussion}
					/>

					<Route
						exact path="/discuss-question/:discussId"
						component={DiscussionQuestion}
					/>

					<Route
						path="/edit-question/:topic/:subtopic/:id"
						component={withRouter(AddQuestion)}
					/>

					<Route
						exact
						path="/custom-test"
						component={CustomTestsList}
					/>

					<Route
						exact
						path="/custom-test/:testId/edit"
						component={EditCustomTest}
					/>

					<Route
						exact
						path="/custom-test/:testId"
						component={CustomTest}
					/>

					

					<Route 
						path="/module/:moduleName/add-new-question/:topic/:subtopic"
						component={AddQuestion}
					/>

					<Route
						path="/module/:moduleName/add-question/:topic/:subtopic"
						component={AddQuestion}
					/>
					
					<Route
						path="/module/:moduleName/edit-question/:topic/:subtopic/:id"
						component={AddQuestion}
					/>

					<Route
						path="/module/:moduleName/add-resources/:topic/:subtopic"
						component={AddResources}
					/>
					<Route
						path="/module/:moduleName/edit-resources/:topic/:subtopic/:id"
						component={AddResources}
					/>
					<Route
						path="/test/:id"
						component={PastTest}
					/>

					<Route
						path="/validate-posts"
						component={ValidatePosts}
					/>		
					<Route
						path="/batch-analysis/:batch"
						component={AnalyseBatch}
					/>		
					<Route
						path="/notifications"
						component={Notifications}
					/>	

					<Route exact path="/newTest" component={CreateTestWithModule} />
					<Route exact path="/my-custom-test" component={MyCustomTestsList} />
					<Route exact path="/my-custom-test/:testId" component={MyCustomTest} />
					<Route
						path="/my-custom-test/add-question/:testId"
						render = {() => <AddQuestion customTest = {true}/>}
					/>


					<Route exact path="/my-courses" component={MyCourseList} />
					<Route exact path="/my-course/:courseId" component={MyCourse} />
					
					<Route path="/admin" component={Admin} />
					<Route path="/moderator" component={Moderator} />
					
					<Route path="/module/:moduleName/verify-questions/:topic/:subtopic" component={ShowUnverifiedQuestions} />
					
					<Route path="/start-custom-test/:testId" component={CustomQuiz} />

					<Route path="/add-topic" component={AddTopic} />
					<Route path="/add-subtopic" component={AddSubtopic} />
					<Route path="/add-tags" component={AddTag} />

					<Route path="/profile/:userId" component={Profile} />
					<Route path="/profile" component={Profile} />

					
					<Route path="/posts" component={Posts} />
					<Route path="/post/:postId" component={Post} />
					<Route path="/edit-post/:postId" component={EditPost} />
					<Route path="/syllabus" component={Syllabus} />
					<Route path="/code" component={Code} />

					<Route path="/quiz/:module/:topic/:subtopic" component={Quiz}  />
					
					<Route path="/manage-users" component={ManageUsers} />

					{/* <Route path="/:topic/:subtopic" component={ShowSubtopic} />
					<Route path="/:topic" component={Subtopics} /> */}


					{/* MODULE */}

					
					
				</Switch>
			</Layout>
		</BrowserRouter>
	);
}

export default Hero;
